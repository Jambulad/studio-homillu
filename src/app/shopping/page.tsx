
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Star, Trash2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function ShoppingPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const [newItem, setNewItem] = useState({ name: "", quantity: "" });

  const householdId = user?.uid || "default";

  const shoppingQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "shoppingListItems");
  }, [firestore, user, householdId]);

  const { data: items, isLoading } = useCollection(shoppingQuery);

  const addItem = () => {
    if (!newItem.name || !user) return;

    const itemData = {
      householdId,
      name: newItem.name,
      quantity: newItem.quantity || "1",
      isChecked: false,
      isFavorite: false,
      createdAt: serverTimestamp(),
      addedByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const shoppingRef = collection(firestore, "households", householdId, "shoppingListItems");
    addDocumentNonBlocking(shoppingRef, itemData);
    setNewItem({ name: "", quantity: "" });
  };

  const toggleCheck = (itemId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "households", householdId, "shoppingListItems", itemId);
    updateDocumentNonBlocking(itemRef, { isChecked: !currentStatus });
  };

  const toggleFavorite = (itemId: string, currentStatus: boolean) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "households", householdId, "shoppingListItems", itemId);
    updateDocumentNonBlocking(itemRef, { isFavorite: !currentStatus });
  };

  const deleteItem = (itemId: string) => {
    if (!firestore) return;
    const itemRef = doc(firestore, "households", householdId, "shoppingListItems", itemId);
    deleteDocumentNonBlocking(itemRef);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          {t("shopping.title")}
        </h1>
        <p className="text-muted-foreground mt-1">{t("shopping.description")}</p>
      </div>

      <div className="flex gap-4 p-4 bg-card rounded-xl shadow-sm border">
        <Input 
          placeholder={t("shopping.addItem")} 
          value={newItem.name} 
          onChange={(e) => setNewItem({...newItem, name: e.target.value})} 
          className="flex-1"
        />
        <Input 
          placeholder={t("shopping.quantity")} 
          value={newItem.quantity} 
          onChange={(e) => setNewItem({...newItem, quantity: e.target.value})} 
          className="w-32"
        />
        <Button onClick={addItem} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("common.add")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t("shopping.addItem")}</TableHead>
                <TableHead>{t("shopping.quantity")}</TableHead>
                <TableHead className="w-12 text-center">{t("shopping.favorites")}</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((item: any) => (
                <TableRow key={item.id} className={item.isChecked ? "opacity-50" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={item.isChecked} 
                      onCheckedChange={() => toggleCheck(item.id, item.isChecked)} 
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${item.isChecked ? "line-through" : ""}`}>
                    {item.name}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => toggleFavorite(item.id, item.isFavorite)}
                      className={item.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}
                    >
                      <Star className={`h-5 w-5 ${item.isFavorite ? "fill-current" : ""}`} />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    {t("shopping.noItems")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
