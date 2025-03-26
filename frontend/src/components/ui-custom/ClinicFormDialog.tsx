
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Clinic } from "@/types";
import { addClinic, updateClinic } from "@/services/clinicService";

const clinicFormSchema = z.object({
    name: z.string().min(2, { message: "Klinik adı en az 2 karakter olmalıdır" }),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
});

type ClinicFormValues = z.infer<typeof clinicFormSchema>;

interface ClinicFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clinic: Clinic | null;
    onClose: () => void;
}

export default function ClinicFormDialog({
    open,
    onOpenChange,
    clinic,
    onClose,
}: ClinicFormDialogProps) {
    const queryClient = useQueryClient();
    const isEditing = !!clinic;

    const form = useForm<ClinicFormValues>({
        resolver: zodResolver(clinicFormSchema),
        defaultValues: {
            name: "",
            address: "",
            phoneNumber: "",
        },
    });

    // Reset form when clinic changes
    useEffect(() => {
        if (clinic) {
            form.reset({
                name: clinic.name,
                address: clinic.address || "",
                phoneNumber: clinic.phoneNumber || "",
            });
        } else {
            form.reset({
                name: "",
                address: "",
                phoneNumber: "",
            });
        }
    }, [clinic, form]);

    // Add clinic mutation
    const addClinicMutation = useMutation({
        mutationFn: (data: ClinicFormValues) => addClinic(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clinics"] });
            toast.success("Klinik başarıyla eklendi");
            onClose();
        },
        onError: (error) => {
            console.error("Error adding clinic:", error);
            toast.error("Klinik eklenirken bir hata oluştu");
        },
    });

    // Update clinic mutation
    const updateClinicMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: ClinicFormValues }) =>
            updateClinic(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["clinics"] });
            toast.success("Klinik başarıyla güncellendi");
            onClose();
        },
        onError: (error) => {
            console.error("Error updating clinic:", error);
            toast.error("Klinik güncellenirken bir hata oluştu");
        },
    });

    const onSubmit = (data: ClinicFormValues) => {
        if (isEditing && clinic) {
            updateClinicMutation.mutate({ id: clinic.id, data });
        } else {
            addClinicMutation.mutate(data);
        }
    };

    const isPending = addClinicMutation.isPending || updateClinicMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-primary" />
                        <DialogTitle>
                            {isEditing ? "Klinik Düzenle" : "Yeni Klinik Ekle"}
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Klinik Adı</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Klinik adını girin" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Adres</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Adres bilgisi girin" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Telefon Numarası</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Telefon numarası girin" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="gap-2 sm:gap-0">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    <X className="h-4 w-4 mr-2" />
                                    İptal
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Kaydediliyor..." : isEditing ? "Güncelle" : "Kaydet"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}