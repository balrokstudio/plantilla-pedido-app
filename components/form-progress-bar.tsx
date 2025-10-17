"use client"

import { useMemo } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { OrderFormData } from "@/lib/validations"

interface FormProgressBarProps {
  form: UseFormReturn<OrderFormData>
}

export function FormProgressBar({ form }: FormProgressBarProps) {
  const formValues = form.watch()

  const progress = useMemo(() => {
    let totalFields = 0
    let completedFields = 0

    // Customer Information (3 required fields)
    const customerFields = [
      formValues.company_or_professional,
      formValues.email,
      formValues.phone,
    ]
    
    totalFields += 3
    completedFields += customerFields.filter(field => field && field.trim() !== "").length

    // Products (each product has multiple fields)
    const products = formValues.products || []
    
    products.forEach((product) => {
      // Required fields (5)
      const requiredProductFields = [
        product.patient_name,
        product.patient_lastname,
        product.product_type,
        product.template_size,
        product.template_color,
      ]
      
      totalFields += 5
      completedFields += requiredProductFields.filter(field => field && field.trim() !== "").length

      // Antepié - Zona metatarsal (2 fields: left and right)
      totalFields += 2
      if (product.forefoot_metatarsal_left && product.forefoot_metatarsal_left.trim() !== "") {
        completedFields += 1
      }
      if (product.forefoot_metatarsal && product.forefoot_metatarsal.trim() !== "") {
        completedFields += 1
      }

      // Cuña Anterior - conditional logic for LEFT foot
      totalFields += 1
      const anteriorWedgeLeftValue = product.anterior_wedge_left
      if (anteriorWedgeLeftValue && anteriorWedgeLeftValue.trim() !== "") {
        if (anteriorWedgeLeftValue === "Cuña Anterior Interna") {
          const anteriorWedgeLeftMm = product.anterior_wedge_left_mm
          if (anteriorWedgeLeftMm && anteriorWedgeLeftMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          completedFields += 1
        }
      }

      // Cuña Anterior - conditional logic for RIGHT foot
      totalFields += 1
      const anteriorWedgeValue = product.anterior_wedge
      if (anteriorWedgeValue && anteriorWedgeValue.trim() !== "") {
        if (anteriorWedgeValue === "Cuña Anterior Interna") {
          const anteriorWedgeMm = product.anterior_wedge_mm
          if (anteriorWedgeMm && anteriorWedgeMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          completedFields += 1
        }
      }

      // Mediopié - Zona arco (2 fields: left and right)
      totalFields += 2
      if (product.midfoot_arch_left && product.midfoot_arch_left.trim() !== "") {
        completedFields += 1
      }
      if (product.midfoot_arch && product.midfoot_arch.trim() !== "") {
        completedFields += 1
      }

      // Retropié - Zona calcáneo - conditional logic for LEFT foot
      totalFields += 1
      const rearfootLeftValue = product.rearfoot_calcaneus_left
      if (rearfootLeftValue && rearfootLeftValue.trim() !== "") {
        if (rearfootLeftValue === "Realce en talón") {
          const heelRaiseLeftMm = product.heel_raise_left_mm
          if (heelRaiseLeftMm && heelRaiseLeftMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          completedFields += 1
        }
      }

      // Retropié - Zona calcáneo - conditional logic for RIGHT foot
      totalFields += 1
      const rearfootValue = product.rearfoot_calcaneus
      if (rearfootValue && rearfootValue.trim() !== "") {
        if (rearfootValue === "Realce en talón") {
          const heelRaiseMm = product.heel_raise_mm
          if (heelRaiseMm && heelRaiseMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          completedFields += 1
        }
      }

      // Cuña Posterior - conditional logic for LEFT foot
      totalFields += 1
      const posteriorWedgeLeftValue = product.posterior_wedge_left
      if (posteriorWedgeLeftValue && posteriorWedgeLeftValue.trim() !== "") {
        if (posteriorWedgeLeftValue === "Cuña Posterior Externa" || posteriorWedgeLeftValue === "Cuña Posterior Interna") {
          const posteriorWedgeLeftMm = product.posterior_wedge_left_mm
          if (posteriorWedgeLeftMm && posteriorWedgeLeftMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          completedFields += 1
        }
      }

      // Cuña Posterior - conditional logic for RIGHT foot
      totalFields += 1
      const posteriorWedgeValue = product.posterior_wedge
      if (posteriorWedgeValue && posteriorWedgeValue.trim() !== "") {
        if (posteriorWedgeValue === "Cuña Posterior Externa" || posteriorWedgeValue === "Cuña Posterior Interna") {
          const posteriorWedgeMm = product.posterior_wedge_mm
          if (posteriorWedgeMm && posteriorWedgeMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          completedFields += 1
        }
      }

      // All mm fields are only counted as part of their parent field completion
    })

    // Notes are NOT counted for progress bar completion

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0
    
    return {
      percentage,
      completedFields,
      totalFields,
    }
  }, [formValues])

  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso del formulario
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({progress.completedFields} de {progress.totalFields} campos completados)
            </span>
          </div>
          <span className={`text-sm font-semibold transition-colors duration-500 ${
            progress.percentage === 100
              ? "text-[#9CCE66]"
              : "text-blue-600 dark:text-blue-400"
          }`}>
            {progress.percentage}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative w-full h-[18px] bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full ${
              progress.percentage === 100
                ? "bg-[#9CCE66]"
                : "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
            }`}
            style={{ width: `${progress.percentage}%` }}
          >
            {/* Shimmer effect when not complete */}
            {progress.percentage < 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
          </div>
          
          {/* Completion checkmark */}
          {progress.percentage === 100 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white animate-scale-in"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
