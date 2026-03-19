
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Star, Trash2, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

const DUMMY_ITEMS = [
  { id: "d1", name: "Whole Milk", quantity: "2 Liters", isChecked: false, isFavorite: true, dueDate: "2024-12-25" },
  { id: "d2", name: "Brown Eggs", quantity: "1 Dozen", isChecked: true, isFavorite: false, dueDate: "2024-12-24" },
  { id: "d3", name: "Sourdough Bread", quantity: "1 Loaf", isChecked: false, isFavorite: true, dueDate: "2024-12-26" },
  { id: "d4", name: "Red Apples", quantity: "6 pcs", isChecked: false, isFavorite: false, dueDate: "2024-12-27" },
];

export default function ShoppingPage() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [newItem, setNewItem] = useState({ name: "", quantity: "", dueDate: "" });

  const householdId = user?.uid || "placeholder";

  const shoppingQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, "households", householdId, "shoppingListItems");
  }, [firestore, user, householdId]);

  const { data: cloudItems, isLoading } = useCollection(shoppingQuery);

  const displayItems = user ? cloudItems : DUMMY_ITEMS;

  const addItem = () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Sign in to manage your household shopping list." });
      return;
    }
    if (!newItem.name) return;

    const itemData = {
      householdId,
      name: newItem.name,
      quantity: newItem.quantity || "1",
      dueDate: newItem.dueDate || null,
      isChecked: false,
      isFavorite: false,
      createdAt: serverTimestamp(),
      addedByUserId: user.uid,
      householdMembers: { [user.uid]: "admin" }
    };

    const shoppingRef = collection(firestore, "households", householdId, "shoppingListItems");
    addDocumentNonBlocking(shoppingRef, itemData);
    setNewItem({ name: "", quantity: "", dueDate: "" });
  };

  const toggleCheck = (itemId: string, currentStatus: boolean) => {
    if (!user || itemId.startsWith("d")) {
      toast({ title: "Preview Mode", description: "Please sign in to update items." });
      return;
    }
    const itemRef = doc(firestore, "households", householdId, "shoppingListItems", itemId);
    updateDocumentNonBlocking(itemRef, { isChecked: !currentStatus });
  };

  const toggleFavorite = (itemId: string, currentStatus: boolean) => {
    if (!user || itemId.startsWith("d")) return;
    const itemRef = doc(firestore, "households", householdId, "shoppingListItems", itemId);
    updateDocumentNonBlocking(itemRef, { isFavorite: !currentStatus });
  };

  const deleteItem = (itemId: string) => {
    if (!user || itemId.startsWith("d")) return;
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

      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl shadow-sm border">
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
          className="w-full sm:w-32"
        />
        <div className="relative w-full sm:w-48">
          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input 
            type="date"
            value={newItem.dueDate} 
            onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})} 
            className="pl-10"
          />
        </div>
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
          {!user && (
            <div className="bg-accent/5 border-b p-3 text-center text-sm font-medium text-accent">
              Viewing guest items. Log in to create your shared family list.
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>{t("shopping.addItem")}</TableHead>
                <TableHead>{t("shopping.quantity")}</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-12 text-center">{t("shopping.favorites")}</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems?.map((item: any) => (
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
                  <TableCell>
                    {item.dueDate ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        {item.dueDate}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No date</span>
                    )}
                  </TableCell>
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
                    {user && !item.id.startsWith("d") && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteItem(item.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {displayItems?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
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
