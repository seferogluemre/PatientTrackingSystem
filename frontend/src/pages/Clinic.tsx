
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell
} from "@/components/ui/table";
import { Clinic } from "@/types";
import { deleteClinic, getClinics } from "@/services/clinicService";
import ClinicFormDialog from "@/components/ui-custom/ClinicFormDialog";
import { useNavigate } from "react-router-dom";
export default function Clinics() {
    const queryClient = useQueryClient();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

    const navigate = useNavigate();
    // Fetch clinics
    const {
        data: clinics = [],
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["clinics"],
        queryFn: getClinics
    });

    // Delete clinic mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteClinic(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clinics"] });
            toast.success("Klinik başarıyla silindi");
        },
        onError: (error) => {
            console.error("Error deleting clinic:", error);
            toast.error("Klinik silinirken bir hata oluştu");
        }
    });

    const handleOpenAddDialog = () => {
        setSelectedClinic(null);
        setIsAddDialogOpen(true);
    };

    const handleOpenEditDialog = (clinic: Clinic) => {
        setSelectedClinic(clinic);
        setIsAddDialogOpen(true);
    };

    const handleGoBack = () => {
        navigate(-1);
    };


    const handleCloseDialog = () => {
        setIsAddDialogOpen(false);
        setSelectedClinic(null);
    };

    const handleDeleteClinic = (id: string) => {
        if (window.confirm("Bu kliniği silmek istediğinizden emin misiniz?")) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-lg">Klinikler yükleniyor...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-destructive">
                    Klinikler yüklenirken bir hata oluştu: {error instanceof Error ? error.message : "Bilinmeyen hata"}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="mr-4"
            >
                <ArrowLeft className="h-6 font-bold w-6" />
            </Button>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center">
                        <Building className="h-6 w-6 mr-2 text-primary" />
                        <CardTitle>Klinikler</CardTitle>
                    </div>
                    <Button onClick={handleOpenAddDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Klinik
                    </Button>
                </CardHeader>
                <CardContent>
                    {clinics.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Henüz klinik kaydı bulunmamaktadır. Yeni klinik eklemek için "Yeni Klinik" butonuna tıklayın.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Klinik Adı</TableHead>
                                    <TableHead>Adres</TableHead>
                                    <TableHead>Telefon</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {clinics.map((clinic) => (
                                    <TableRow key={clinic.id}>
                                        <TableCell className="font-medium">{clinic.name}</TableCell>
                                        <TableCell>{clinic.address || "-"}</TableCell>
                                        <TableCell>{clinic.phoneNumber || "-"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleOpenEditDialog(clinic)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteClinic(clinic.id)}
                                                    disabled={deleteMutation.isPending && deleteMutation.variables === clinic.id}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <ClinicFormDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                clinic={selectedClinic}
                onClose={handleCloseDialog}
            />
        </div>
    );
}