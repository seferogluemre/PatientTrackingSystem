import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { getUserById } from "@/data/mockData";

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tcNo: string | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, tcNo }) => {
    const [userDetail, setUserDetail] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && tcNo) {
            setLoading(true);
            setError(null);
            getUserById(Number(tcNo))
                .then(data => {
                    setUserDetail(data);
                })
        } else {
            setUserDetail(null);
        }
    }, [isOpen, tcNo]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("tr-TR");
    };

    const user = userDetail?.data?.[0];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Kullanıcı Detayları</DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                ) : error ? (
                    <div className="py-6 text-center text-red-500">{error}</div>
                ) : user ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Ad Soyad:</span>
                            <span className="col-span-2">{user.first_name} {user.last_name}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">TC No:</span>
                            <span className="col-span-2">{user.tc_no}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">E-posta:</span>
                            <span className="col-span-2">{user.email}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Telefon:</span>
                            <span className="col-span-2">{user.phone || "Belirtilmemiş"}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Adres:</span>
                            <span className="col-span-2">{user.address || "Belirtilmemiş"}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Rol:</span>
                            <span className="col-span-2">{user.role}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                            <span className="font-medium">Katılma Tarihi:</span>
                            <span className="col-span-2">{formatDate(user.joined_at)}</span>
                        </div>
                    </div>
                ) : (
                    <div className="py-6 text-center text-gray-500">Kullanıcı bilgisi bulunamadı.</div>
                )}

                <DialogFooter>
                    <Button onClick={onClose}>Kapat</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UserDetailModal;