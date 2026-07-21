import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
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
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// redux RTK
import { useProductsControllerFindAllQuery } from "@/Redux/Services/productsAPpiService";
import { useEditStoreMutation } from "@/Redux/Services/storeApiService";

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

  const {
    data: productsData,
    isFetching: isProductFetching,
    refetch: productRefetch,
  } = useProductsControllerFindAllQuery({
    pageNumber: currentPage,
    limit: 10,
    search: undefined,
  });

  const totalProductPages =
    productsData?.response?.body?.pagination?.totalPages || 0;

  console.log("All Products:", allProducts);
  console.log("Selected Products:", selectedProducts);
  console.log("Current Page:", currentPage);
  console.log("Total Product Pages:", totalProductPages);
  console.log("step", step);
  console.log("Quantities:", quantities);

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
        vat: product?.productVatOrNoVat ?? 0,
      })
    ) || [];

  const handleDeleteClick = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
    setQuantities((prev) => {
      const newQuantities = { ...prev };
      delete newQuantities[productId];
      return newQuantities;
    });
  };
  const handleSubmit = async () => {
    await setQuantities((prev) => {
      const mixedQuantities = { ...initialQuantities, ...prev };
      return mixedQuantities;
    });

    const quantitiesArray = Object.entries(quantities).map(
      ([productId, quantity]) => ({
        productId,
        quantity,
      })
    );

    editStore({
      storeID: params.id,
      storeProducts: quantitiesArray.map((product) => ({
        productID: product.productId,
        productQuantity: quantities[product.quantity] || 1,
      })),
    })
      .unwrap()
      .then(() => {
        if (changeModalStatus) changeModalStatus(false);
        if (onProductsUpdated) onProductsUpdated();
      })
      .catch((error) => {
        console.error("Failed to edit store:", error);
      });
  };

  useEffect(() => {
    if (modalStatus) {
      setStep(1);
      setCurrentPage(1);
      setSelectedProducts([]);
      setAllProducts([]);
      productRefetch();
      setAllProducts(products);
    }
  }, [modalStatus]);

  useEffect(() => {
    if (productsData?.response?.body?.content) {
      setAllProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newProducts = products.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newProducts];
      });
    }
  }, [productsData]);

  return (
    <Dialog open={modalStatus} onOpenChange={changeModalStatus}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Products</DialogTitle>
        </DialogHeader>

        {/* stepper kuno */}
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 1
                    ? "bg-[#DF5C5D] text-white"
                    : "bg-[#ec7979] text-white"
                }`}
              >
                1
              </div>
              <span
                className={
                  step === 1 ? "text-[#DF5C5D] font-medium" : "text-[#ec7979]"
                }
              >
                Choose Products
              </span>
            </div>
            <div
              className={`flex-1 h-[2px] ${
                step === 2 ? "bg-[#ec7979]" : "bg-gray-200"
              }`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 2 ? "bg-[#DF5C5D] text-white" : "bg-gray-200"
                }`}
              >
                2
              </div>
              <span className={step === 2 ? "text-[#DF5C5D] font-medium" : ""}>
                Verification
              </span>
            </div>
          </div>
        </div>

        {step === 1 ? (
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-auto">
              <Table className="min-w-full table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 z-10 bg-white w-[50px]">
                      <Checkbox
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setSelectedProducts(allProducts);
                            setQuantities(
                              allProducts.reduce((acc, product) => {
                                acc[product.id] = product.stocks > 0 ? 1 : 0;
                                return acc;
                              }, {} as Record<string, number>)
                            );
                          } else {
                            setSelectedProducts([]);
                            setQuantities(initialQuantities);
                          }
                        }}
                        checked={
                          selectedProducts.length > 0 &&
                          selectedProducts.length === allProducts.length
                        }
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
                    .map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        <TableCell className="w-[50px]">
                          <Checkbox
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
                                  newQuantities[product.id] =
                                    product.stocks > 1 ? 1 : 0;
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
                        <TableCell>₱{product.price.toFixed(2)}</TableCell>
                        <TableCell>{product.stocks} items</TableCell>
                      </TableRow>
                    ))}
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
          <div className="space-y-4">
            <div className="border rounded-lg">
              <div className="max-h-[400px] overflow-auto">
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
                      selectedProducts.map((product) => (
                        <TableRow key={product.id} className="hover:bg-gray-50">
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
                          <TableCell>₱{product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={1}
                              max={product.stocks}
                              value={quantities[product.id] ?? 1}
                              onChange={(e) => {
                                const value = Math.max(
                                  1,
                                  Math.min(
                                    Number(e.target.value),
                                    product.stocks
                                  )
                                );
                                setQuantities((prev) => ({
                                  ...prev,
                                  [product.id]: value,
                                }));
                              }}
                              className="w-20 border rounded px-2 py-1 text-center"
                              disabled={product.stocks === 0}
                            />{" "}
                            / {product.stocks} items
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 mt-4">
          <h1>&nbsp;</h1>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setStep(step === 1 ? 2 : 1);
              }}
            >
              {step === 1 ? "Next Step" : "Previous Step"}
            </Button>
            {step === 2 ? (
              <Button
                className="mt-4 ml-2 bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
                onClick={() => {
                  handleSubmit();
                  if (changeModalStatus) changeModalStatus(false);
                }}
                disabled={selectedProducts.length === 0}
              >
                Submit
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
