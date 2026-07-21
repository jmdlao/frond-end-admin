import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const AddUserForm = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleAddUser = () => {
    setShowConfirm(false);
    // Navigate after a short delay to ensure toast is visible
    setTimeout(() => {
      router.push("/users");
    }, 100);
  };

  return (
    <>
      <Button
        className="bg-[#DF5C5D] text-white"
        type="button"
        onClick={() => setShowConfirm(true)}
      >
        Add New User
      </Button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Add User</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to add this user?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#DF5C5D] text-white"
              onClick={handleAddUser}
            >
              Yes, Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddUserForm; 