import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserDetailsPanelProps {
    user: any;
    userType: string;
}

const UserDetailsPanel: React.FC<UserDetailsPanelProps> = ({ user, userType }) => {
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const [year, month, day] = dateString.split("-");
        return `${day}.${month}.${year}`;
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">
                    {userType === "doctors" ? "Doktor Bilgileri" : "Hasta Bilgileri"}
                </h2>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <div className="flex items-center justify-center bg-gray-200 rounded-full w-24 h-24">
                    <UserCircle className="h-16 w-16 text-gray-400" />
                </div>
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-bold">{user.name}</h3>
                    {userType === "doctors" && (
                        <p className="text-gray-600">{user.specialization}</p>
                    )}
                    {userType === "patients" && (
                        <p className="text-gray-600">Doğum Tarihi: {formatDate(user.birthDate)}</p>
                    )}
                    <p className="text-gray-500">{user.email}</p>
                    <p className="text-gray-500">{user.phone}</p>
                </div>
            </div>

            <Separator className="my-4" />

            {userType === "doctors" && (
                <div className="grid gap-4">
                    <div>
                        <h4 className="font-medium text-sm">Çalışma Saatleri</h4>
                        <p className="text-sm text-gray-600">Pazartesi - Cuma: 09:00 - 17:00</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">Randevu Bilgisi</h4>
                        <p className="text-sm text-gray-600">Bugün 5 randevu</p>
                        <p className="text-sm text-gray-600">Bu hafta 25 randevu</p>
                    </div>
                </div>
            )}

            {userType === "patients" && (
                <div className="grid gap-4">
                    <div>
                        <h4 className="font-medium text-sm">Son Ziyaret</h4>
                        <p className="text-sm text-gray-600">{formatDate(user.lastVisit)}</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">Randevu Geçmişi</h4>
                        <p className="text-sm text-gray-600">Son 6 ayda 3 ziyaret</p>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm">Sağlık Notları</h4>
                        <p className="text-sm text-gray-600">Notlar burada görüntülenecek...</p>
                    </div>
                </div>
            )}

            <div className="mt-auto pt-4">
                <Button className="w-full" variant="secondary">
                    {userType === "doctors" ? "Randevu Takvimini Görüntüle" : "Randevu Oluştur"}
                </Button>
            </div>
        </div>
    );
};

export default UserDetailsPanel