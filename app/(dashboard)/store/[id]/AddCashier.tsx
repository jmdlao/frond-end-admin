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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEditStoreMutation } from "@/Redux/Services/storeApiService";
import { useUserControllerFindAllQuery } from "@/Redux/Services/userApiService";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return value;
};

interface AddCashierProps {
  modalStatus: boolean;
  changeModalStatus?: (status: boolean) => void;
  onCashiersUpdated?: () => void;
  currentCashiers?: {
    id: any;
    name: string;
    branchLocation: any;
    contactNumber: any;
  }[];
}

interface cashier {
  id: string;
  name: string;
  address: string;
  contactNumber: string;
}

export function AddCashier({
  modalStatus,
  changeModalStatus,
  onCashiersUpdated,
  currentCashiers = [],
}: AddCashierProps) {
  const params = useParams<{ id: string }>();
  const [allcashiers, setAllCashiers] = useState<cashier[]>([]);
  const [selectedCashiers, setSelectedCashiers] = useState<cashier[]>([]);

  const [editStore] = useEditStoreMutation();
  const { data: users } = useUserControllerFindAllQuery({
    page: 1,
    search: "",
    limit: 10,
    userType: 3,
  });

  const cashiers =
    users?.response?.body?.content.map((cashier: any) => ({
      id: cashier._id,
      name: `${cashier.firstName} ${cashier.lastName}`,
      address: cashier.address,
      contactNumber: cashier.phoneNumber,
    })) || [];

  const handleAddCashier = async () => {
    const mergedCashiers = [
      ...currentCashiers.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.branchLocation,
        contactNumber: c.contactNumber,
      })),
      ...selectedCashiers.filter(
        (sc) => !currentCashiers.some((cc) => cc.id === sc.id)
      ),
    ];
    await setSelectedCashiers(mergedCashiers);

    editStore({
      storeID: params.id,
      storeCashier: selectedCashiers.map((cashier) => ({
        cashierID: cashier.id,
      })),
    })
      .unwrap()
      .then(() => {
        if (changeModalStatus) changeModalStatus(false);
        if (onCashiersUpdated) onCashiersUpdated();
      })
      .catch((error) => {
        console.error("Failed to edit store:", error);
      });
    console.log("Selected Cashiers to Add:", selectedCashiers);
    if (changeModalStatus) changeModalStatus(false);
  };

  useEffect(() => {
    if (users?.response?.body?.content) {
      setAllCashiers(cashiers);
    }
  }, [users]);

  return (
    <Dialog open={modalStatus} onOpenChange={changeModalStatus}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Cashier</DialogTitle>
        </DialogHeader>

        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-auto">
            <Table className="min-w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 z-10 w-[50px]">
                    <Checkbox
                      checked={
                        allcashiers.length > 0 &&
                        allcashiers.every((cashier) =>
                          selectedCashiers.some(
                            (selected) => selected.id === cashier.id
                          )
                        )
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCashiers(allcashiers);
                        } else {
                          setSelectedCashiers(
                            currentCashiers.map((c) => ({
                              id: c.id,
                              name: c.name,
                              address: c.branchLocation,
                              contactNumber: c.contactNumber,
                            }))
                          );
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[200px]">
                    Cashier Name
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[200px]">
                    Cashier Phone
                  </TableHead>
                  <TableHead className="sticky top-0 z-10 w-[200px]">
                    Cashier Address
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allcashiers.filter(
                  (cashier) =>
                    !currentCashiers.some(
                      (current) => current.id === cashier.id
                    )
                ).length === 0 ? (
                  <TableRow>
                    <TableHead colSpan={4} className="text-center">
                      No cashiers available
                    </TableHead>
                  </TableRow>
                ) : (
                  allcashiers
                    .filter(
                      (cashier) =>
                        !currentCashiers.some(
                          (current) => current.id === cashier.id
                        )
                    )
                    .map((cashier) => (
                      <TableRow key={cashier.id} className="hover:bg-gray-50">
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedCashiers.some(
                              (selected) => selected.id === cashier.id
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCashiers((prev) => [
                                  ...prev,
                                  cashier,
                                ]);
                              } else {
                                setSelectedCashiers((prev) =>
                                  prev.filter((c) => c.id !== cashier.id)
                                );
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>{cashier.name}</TableHead>
                        <TableHead>
                          {"0" + formatPhoneNumber(cashier.contactNumber)}
                        </TableHead>
                        <TableHead>{cashier.address}</TableHead>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <h1>&nbsp;</h1>
          <div className="flex justify-end">
            <Button
              className="mt-4 ml-2 bg-[#DF5C5D] hover:bg-[#DF5C5D]/90"
              onClick={() => {
                handleAddCashier();
              }}
              disabled={selectedCashiers.length === 0}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
