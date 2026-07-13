'use server'
import { BookCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";

export type ActionState = {
    error: string | null;
    success: string | null;
    code: string | null;
}

export async function createBook(prevState: ActionState, formData: FormData): Promise<ActionState> {

    const user = await getSessionUser();
    if (!user?.id) {
        return { error: "Tu dois etre connecter pour publier.", success: null, code: "NO_AUTH"};
    }

    const VENDOR_ID = user.id;
    let MAX_BOOKS = 1;
    
    if (user.subscriptionPlan === 'TWENTY_BOOKS') {
        MAX_BOOKS = 20;
    }   else if (user.subscriptionPlan === 'UNLIMITED') {
        MAX_BOOKS = 999;
    }

    const booksCount = await prisma.book.count({ where: { vendorId: VENDOR_ID } });

    if (booksCount >= MAX_BOOKS) {
        return { error: "Limite atteinte. Plan Free = 1 livre max. Passe au Pro pour en ajouter.", 
            success: null, code: "LIMITE_ATTEINTE" };
        
    }

    const imageUrl = formData.get("imageUrl") as string;

    if (!imageUrl) {
        return { error: "Tu dois d'abord uploader une couverture.", success: null, code: "LIMITE_ATTEINTE" };
    }

    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as  string;
        const buyPrice = Number(formData.get("buyPrice"));
        const rentPrice = Number(formData.get("rentPrice"));
        const category = formData.get("category") as BookCategory;
        
        await prisma.book.create({
            data: {
                title,
                description,
                buyPrice,
                rentPrice,
                category,
                imageUrl: imageUrl,
                vendorId: VENDOR_ID,
            }
        });

        revalidatePath("/vendeur/dashboard");

        return { error: null, success: "Livre publié avec succès ", code: "OK" };
    } catch (e) {
        console.error(e);
        return { error: "Erreur base de données. Vérifie tes champs.", success: null, code: "DB_ERROR"};
    }
}