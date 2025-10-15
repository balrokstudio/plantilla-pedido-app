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

      // Standard optional fields without conditional dependencies (2)
      const standardOptionalFields = [
        product.forefoot_metatarsal,
        product.midfoot_arch,
      ]
      
      totalFields += 2
      completedFields += standardOptionalFields.filter(field => field && field.trim() !== "").length

      // Cuña Anterior - conditional logic
      totalFields += 1
      const anteriorWedgeValue = product.anterior_wedge
      if (anteriorWedgeValue && anteriorWedgeValue.trim() !== "") {
        // If "Cuña Anterior Interna" is selected, also need anterior_wedge_mm
        if (anteriorWedgeValue === "Cuña Anterior Interna") {
          const anteriorWedgeMm = product.anterior_wedge_mm
          if (anteriorWedgeMm && anteriorWedgeMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          // Any other option counts as complete
          completedFields += 1
        }
      }

      // Rearfoot calcaneus - conditional logic
      totalFields += 1
      const rearfootValue = product.rearfoot_calcaneus
      if (rearfootValue && rearfootValue.trim() !== "") {
        // If "Realce en talón" is selected, also need heel_raise_mm
        if (rearfootValue === "Realce en talón") {
          const heelRaiseMm = product.heel_raise_mm
          if (heelRaiseMm && heelRaiseMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          // Any other option counts as complete
          completedFields += 1
        }
      }

      // Cuña Posterior - conditional logic
      totalFields += 1
      const posteriorWedgeValue = product.posterior_wedge
      if (posteriorWedgeValue && posteriorWedgeValue.trim() !== "") {
        // If "Cuña Posterior Externa" or "Cuña Posterior Interna" is selected, also need posterior_wedge_mm
        if (posteriorWedgeValue === "Cuña Posterior Externa" || posteriorWedgeValue === "Cuña Posterior Interna") {
          const posteriorWedgeMm = product.posterior_wedge_mm
          if (posteriorWedgeMm && posteriorWedgeMm.trim() !== "") {
            completedFields += 1
          }
        } else {
          // "Ninguno" counts as complete
          completedFields += 1
        }
      }

      // anterior_wedge_mm, heel_raise_mm, and posterior_wedge_mm are only counted as part of their parent field completion
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
