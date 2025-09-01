"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { ProductOption } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Save, X } from "lucide-react"

const CATEGORIES = [
  { value: "product_type", label: "Tipo de Producto" },
  { value: "zone_option_1", label: "Zona 1 - Antepié" },
  { value: "zone_option_2", label: "Zona 2 - Mediopié" },
  { value: "zone_option_3", label: "Zona 3 - Retropié" },
  { value: "zone_option_4", label: "Zona 4 - Dedos" },
  { value: "zone_option_5", label: "Zona 5 - Borde Externo" },
  { value: "heel_height", label: "Altura de Talón" },
  { value: "posterior_wedge", label: "Cuña Posterior" },
]

export function ProductOptionsManager() {
  const [options, setOptions] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("product_type")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    category: "",
    label: "",
    value: "",
    order_index: 0,
  })

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("product_options").select("*").order("category").order("order_index")

      if (error) throw error
      setOptions(data || [])
    } catch (error) {
      console.error("Error fetching options:", error)
      toast({
        title: "Error",
        description: "Error al cargar las opciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("product_options").insert([formData])

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Opción agregada correctamente",
      })

      setFormData({ category: "", label: "", value: "", order_index: 0 })
      setShowAddForm(false)
      fetchOptions()
    } catch (error) {
      console.error("Error adding option:", error)
      toast({
        title: "Error",
        description: "Error al agregar la opción",
        variant: "destructive",
      })
    }
  }

  const handleUpdate = async (id: string, updatedData: Partial<ProductOption>) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("product_options").update(updatedData).eq("id", id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Opción actualizada correctamente",
      })

      setEditingId(null)
      fetchOptions()
    } catch (error) {
      console.error("Error updating option:", error)
      toast({
        title: "Error",
        description: "Error al actualizar la opción",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar esta opción?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("product_options").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Éxito",
        description: "Opción eliminada correctamente",
      })

      fetchOptions()
    } catch (error) {
      console.error("Error deleting option:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la opción",
        variant: "destructive",
      })
    }
  }

  const filteredOptions = options.filter((option) => option.category === selectedCategory)

  const getCategoryLabel = (category: string) => {
    return CATEGORIES.find((cat) => cat.value === category)?.label || category
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gestión de Opciones
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Opción
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="category-filter">Filtrar por Categoría</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showAddForm && (
            <Card className="mb-6 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Agregar Nueva Opción</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Categoría</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Etiqueta</Label>
                    <Input
                      value={formData.label}
                      onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                      placeholder="Nombre visible"
                    />
                  </div>
                  <div>
                    <Label>Valor</Label>
                    <Input
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="Valor interno"
                    />
                  </div>
                  <div>
                    <Label>Orden</Label>
                    <Input
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: Number.parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdd}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {getCategoryLabel(selectedCategory)} ({filteredOptions.length} opciones)
            </h3>

            {filteredOptions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hay opciones en esta categoría</p>
            ) : (
              <div className="space-y-2">
                {filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <h4 className="font-medium">{option.label}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Valor: {option.value} | Orden: {option.order_index}
                        </p>
                      </div>
                      <Badge variant={option.is_active ? "default" : "secondary"}>
                        {option.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(option.id)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(option.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
