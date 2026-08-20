import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// redux RTK
import { useProductsControllerFindAllQuery } from "@/Redux/Services/productsAPpiService";
import {
  useEditStoreMutation,
  useStoreControllerFindAllQuery,
  useUpdateProductStockMutation,
} from "@/Redux/Services/storeApiService";

interface AddProductProps {
  modalStatus: boolean;
  changeModalStatus?: (status: boolean) => void;
  onProductsUpdated?: () => void;
  initialQuantities?: Record<string, number>;
}

interface product {
  id: string;
  name: string;
  code: string;
  price: number;
  sellingPrice: number;
  stocks: number;
  image: string;
  category: string | undefined;
  status: boolean;
  brand?: string;
  vat?: number;
}

export function AddProduct({
  modalStatus,
  changeModalStatus,
  onProductsUpdated,
  initialQuantities = {},
}: AddProductProps) {
  const params = useParams<{ id: string }>();
  const [step, setStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<product[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [allProducts, setAllProducts] = useState<product[]>([]);

  const [editStore] = useEditStoreMutation();
  const [updateProductStock] = useUpdateProductStockMutation();

  const {
    data: productsData,
    isFetching: isProductFetching,
    refetch: productRefetch,
  } = useProductsControllerFindAllQuery({
    pageNumber: currentPage,
    limit: 10,
    search: undefined,
  });

  const { data: allStoresData } = useStoreControllerFindAllQuery({ limit: 100 });

  const getAllocatedInOtherStores = (productId: string): number => {
    if (!allStoresData?.response?.body?.content) return 0;
    let totalAllocated = 0;
    allStoresData.response.body.content.forEach((store: any) => {
      if (String(store._id) !== String(params.id)) {
        const storeProductsList = store.storeProducts || store.storeProduct || [];
        storeProductsList.forEach((sp: any) => {
          const pId = typeof sp.productID === "object" ? sp.productID?._id : sp.productID;
          if (String(pId) === String(productId)) {
            totalAllocated += Number(sp.productQuantity || 0);
          }
        });
      }
    });
    return totalAllocated;
  };

  const totalProductPages =
    productsData?.response?.body?.pagination?.totalPages || 0;

  const products: product[] =
    productsData?.response?.body?.content?.map(
      (product: any): product => ({
        id: product?._id || "",
        name: product?.productName || "",
        code: product?.productCode || "",
        price: product?.productPrice ?? 0,
        sellingPrice: product?.productSellingPrice ?? 0,
        stocks: product?.productQuantity ?? 0,
        image: product?.productImage || "",
        category: product?.categoriesID?.categoryName || "Uncategorized",
        status: product?.productStatus ?? false,
        brand: product?.productBrandID?.brandName || "Unbranded",
        vat: product?.productHasVat?.vatPercent || 0,
      })
    ) || [];

  const handleDeleteClick = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[id];
      return newQuantities;
    });
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMessage(null);
    if (selectedProducts.length === 0) return;

    // Helper to validate clean 24-character hexadecimal Mongo ObjectIds
    const isValidMongoId = (id: string) =>
      Boolean(id) &&
      id !== "undefined" &&
      id !== "null" &&
      /^[0-9a-fA-F]{24}$/.test(id);

    const existingStoreProducts = Object.entries(initialQuantities)
      .filter(([productId]) => isValidMongoId(String(productId)))
      .map(([productId, quantity]) => ({
        productID: String(productId),
        productQuantity: Number(quantity) || 0,
      }));

    const newProducts = selectedProducts
      .filter((p) => isValidMongoId(String(p.id)))
      .map((p) => {
        const allocatedElsewhere = getAllocatedInOtherStores(p.id);
        const availableStock = Math.max(0, p.stocks - allocatedElsewhere);
        const userQty = quantities[p.id];
        // Default to 1 (or availableStock if less) if quantity is not explicitly set or set to 0
        const finalQty =
          userQty !== undefined && userQty > 0
            ? userQty
            : Math.min(1, availableStock);

        return {
          productID: String(p.id),
          productQuantity: Number(finalQty),
        };
      });

    if (newProducts.length === 0) {
      setErrorMessage("No valid products selected to add.");
      return;
    }

    // Combine existing products with newly added/updated products
    const updatedStoreProducts = [...existingStoreProducts];
    newProducts.forEach((np) => {
      const existingIdx = updatedStoreProducts.findIndex(
        (item) => String(item.productID) === String(np.productID)
      );
      if (existingIdx >= 0) {
        updatedStoreProducts[existingIdx] = np;
      } else {
        updatedStoreProducts.push(np);
      }
    });

    // 1. Primary method: PUT /store/updateStore with complete storeProducts array
    let updateStoreSuccess = false;
    try {
      await editStore({
        storeID: params.id,
        storeProducts: updatedStoreProducts,
      }).unwrap();
      updateStoreSuccess = true;
    } catch (error: any) {
      console.error("Failed to edit store products array:", error);
    }

    // 2. Secondary method: PUT /store/updateProductStock per item
    for (const np of newProducts) {
      try {
        await updateProductStock({
          storeID: params.id,
          productID: np.productID,
          productQuantity: np.productQuantity,
        }).unwrap();
        updateStoreSuccess = true;
      } catch (err) {
        console.error("Failed to update product stock:", err);
      }
    }

    if (!updateStoreSuccess) {
      setErrorMessage("Failed to add products to store. Please try again.");
      return;
    }

    if (changeModalStatus) changeModalStatus(false);
    if (onProductsUpdated) onProductsUpdated();
  };

  useEffect(() => {
    if (modalStatus) {
      setStep(1);
      setCurrentPage(1);
      setSelectedProducts([]);
      setQuantities({});
      setErrorMessage(null);
      productRefetch();
    }
  }, [modalStatus]);

  useEffect(() => {
    if (modalStatus && products.length > 0) {
      if (currentPage === 1) {
        setAllProducts(products);
      } else {
        setAllProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newProducts = products.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
    }
  }, [productsData, currentPage, modalStatus]);

  return (
    <Dialog open={modalStatus} onOpenChange={changeModalStatus}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Products</DialogTitle>
          <DialogDescription className="sr-only">
            Select products and allocate branch stock quantities.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {errorMessage}
          </div>
        )}

        {/* stepper */}
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 1
                    ? "bg-[#DF5C5D] text-white"
                    : "bg-[#DF5C5D] text-white"
                }`}
              >
                1
              </div>
              <span className="font-medium text-[#DF5C5D]">
                Select Products
              </span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 2
                    ? "bg-[#DF5C5D] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span
                className={`font-medium ${
                  step === 2 ? "text-[#DF5C5D]" : "text-gray-500"
                }`}
              >
                Quantity Allocation
              </span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="flex-1 min-h-0 space-y-4">
            <div className="border rounded-lg max-h-[45vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] sticky top-0 z-10 bg-white">
                      <Checkbox
                        checked={
                          allProducts
                            .filter(
                              (product) => !(product.id in initialQuantities)
                            )
                            .every((p) =>
                              selectedProducts.some(
                                (selected) => selected.id === p.id
                              )
                            ) &&
                          allProducts.filter(
                            (product) => !(product.id in initialQuantities)
                          ).length > 0
                        }
                        onCheckedChange={(checked: boolean) => {
                          const availableSelectable = allProducts.filter(
                            (p) => !(p.id in initialQuantities)
                          );
                          if (checked) {
                            setSelectedProducts(availableSelectable);
                            const newQuantities: Record<string, number> = {};
                            availableSelectable.forEach((p) => {
                              newQuantities[p.id] = 0;
                            });
                            setQuantities(newQuantities);
                          } else {
                            setSelectedProducts([]);
                            setQuantities({});
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">
                      Product Code
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">
                      Image
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">
                      Product Name
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">
                      Price
                    </TableHead>
                    <TableHead className="sticky top-0 z-10 bg-white">
                      Stocks
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {allProducts
                    .filter((product) => !(product.id in initialQuantities))
                    .map((product) => {
                      const allocatedElsewhere = getAllocatedInOtherStores(
                        product.id
                      );
                      const availableStock = Math.max(
                        0,
                        product.stocks - allocatedElsewhere
                      );

                      return (
                        <TableRow
                          key={product.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="w-[50px]">
                            <Checkbox
                              disabled={availableStock === 0}
                              checked={selectedProducts.some(
                                (p) => p.id === product.id
                              )}
                              onCheckedChange={(checked: boolean) => {
                                setSelectedProducts((prev) =>
                                  checked
                                    ? [...prev, product]
                                    : prev.filter((p) => p.id !== product.id)
                                );
                                setQuantities((prev) => {
                                  const newQuantities = { ...prev };
                                  if (checked) {
                                    newQuantities[product.id] = 0;
                                  } else {
                                    delete newQuantities[product.id];
                                  }
                                  return newQuantities;
                                });
                              }}
                            />
                          </TableCell>
                          <TableCell>{product.code}</TableCell>
                          <TableCell>
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{formatCurrency(product.price)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span
                                className={`font-semibold text-xs ${
                                  availableStock > 0
                                    ? "text-blue-600"
                                    : "text-red-500"
                                }`}
                              >
                                {availableStock} available
                              </span>
                              <span className="text-[11px] text-gray-500">
                                Total: {product.stocks} ({allocatedElsewhere} in
                                other stores)
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  {isProductFetching && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading products...
                      </TableCell>
                    </TableRow>
                  )}
                  {products.length === 0 && !isProductFetching && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                  {totalProductPages !== currentPage && !isProductFetching ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <Button
                          variant="ghost"
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                          Load More
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : totalProductPages === currentPage ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No more products to load.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="flex-1 min-h-0 space-y-4">
            <div className="border rounded-lg max-h-[45vh] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product Code</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Product Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No products selected.
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedProducts.map((product) => {
                        const allocatedElsewhere = getAllocatedInOtherStores(
                          product.id
                        );
                        const availableStock = Math.max(
                          0,
                          product.stocks - allocatedElsewhere
                        );
                        const currentQty = quantities[product.id] ?? 0;
                        const isInvalid = currentQty > availableStock;

                        return (
                          <TableRow
                            key={product.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="w-[50px]">
                              {product.code}
                            </TableCell>
                            <TableCell>
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{formatCurrency(product.price)}</TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={availableStock}
                                    value={
                                      quantities[product.id] === undefined
                                        ? 0
                                        : quantities[product.id]
                                    }
                                    onChange={(e) => {
                                      const rawVal = e.target.value;
                                      const inputVal =
                                        rawVal === "" ? 0 : Number(rawVal);
                                      setQuantities((prev) => ({
                                        ...prev,
                                        [product.id]: inputVal,
                                      }));
                                    }}
                                    className={`w-20 border rounded px-2 py-1 text-center ${
                                      isInvalid ? "border-red-500 bg-red-50" : ""
                                    }`}
                                    disabled={availableStock === 0}
                                  />
                                  <span className="text-xs text-gray-500">
                                    / {availableStock} available (
                                    {allocatedElsewhere} in other stores)
                                  </span>
                                </div>
                                {isInvalid && (
                                  <span className="text-xs text-[#DF5C5D] font-semibold">
                                    Invalid: Only {availableStock} stocks available
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteClick(product.id)}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-trash-2 text-red-500"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <line x1="10" x2="10" y1="11" y2="17" />
                                  <line x1="14" x2="14" y1="11" y2="17" />
                                </svg>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
        ) : null}

        <div className="flex justify-end items-center gap-2 pt-4 border-t mt-auto">
          <Button
            variant="outline"
            onClick={() => {
              setStep(step === 1 ? 2 : 1);
            }}
            disabled={step === 1 && selectedProducts.length === 0}
          >
            {step === 1 ? "Next Step" : "Previous Step"}
          </Button>
          {step === 2 ? (
            <Button
              className="bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
              onClick={() => {
                handleSubmit();
              }}
              disabled={
                selectedProducts.length === 0 ||
                selectedProducts.some((p) => {
                  const avail = Math.max(
                    0,
                    p.stocks - getAllocatedInOtherStores(p.id)
                  );
                  const qty = quantities[p.id] ?? 0;
                  return qty > avail;
                })
              }
            >
              Submit
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
