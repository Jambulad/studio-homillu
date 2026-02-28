
"use client"

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Star, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  isFavorite: boolean;
  isChecked: boolean;
}

export default function ShoppingPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: "1", name: "Milk", quantity: "2 Liters", isFavorite: true, isChecked: false },
    { id: "2", name: "Apples", quantity: "1 kg", isFavorite: false, isChecked: true },
    { id: "3", name: "Wheat Flour", quantity: "5 kg", isFavorite: true, isChecked: false },
  ]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "" });

  const addItem = () => {
    if (newItem.name) {
      setItems([...items, { ...newItem, id: Date.now().toString(), isFavorite: false, isChecked: false }]);
      setNewItem({ name: "", quantity: "" });
    }
  };

  const toggleCheck = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
  };

  const toggleFavorite = (id: string) => {
    setItems(items.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          {t("shopping.title")}
        </h1>
        <p className="text-muted-foreground mt-1">Never miss an item again.</p>
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
            {items.map((item) => (
              <TableRow key={item.id} className={item.isChecked ? "opacity-50" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={item.isChecked} 
                    onCheckedChange={() => toggleCheck(item.id)} 
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
                    onClick={() => toggleFavorite(item.id)}
                    className={item.isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground"}
                  >
                    <Star className={`h-5 w-5 ${item.isFavorite ? "fill-current" : ""}`} />
                  </Button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
