'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loading } from '@/components/ui/loading'
import { useToast } from '@/components/ui/toast'
import type { FormField } from '@/types'

interface DynamicFormProps {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => Promise<void>
  submitLabel?: string
  loading?: boolean
}

export function DynamicForm({
  fields,
  onSubmit,
  submitLabel = 'Enviar',
  loading = false,
}: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<Record<string, number>>({})
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const formValues = watch()

  // Verifica se campo deve ser exibido (condicionais)
  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditional) return true

    const conditionValue = formValues[field.conditional.field]
    return conditionValue === field.conditional.value
  }

  // Renderiza campo baseado no tipo
  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null

    const error = errors[field.name]?.message as string | undefined

    return (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.name} required={field.required}>
          {field.label}
        </Label>

        {/* Text Input */}
        {field.type === 'text' && (
          <Input
            id={field.name}
            placeholder={field.placeholder}
            error={error}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
              minLength: field.validation?.min
                ? {
                    value: field.validation.min,
                    message: field.validation.message || `Mínimo ${field.validation.min} caracteres`,
                  }
                : undefined,
              pattern: field.validation?.pattern
                ? {
                    value: new RegExp(field.validation.pattern),
                    message: field.validation.message || 'Formato inválido',
                  }
                : undefined,
            })}
          />
        )}

        {/* Email Input */}
        {field.type === 'email' && (
          <Input
            id={field.name}
            type="email"
            placeholder={field.placeholder}
            error={error}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            })}
          />
        )}

        {/* Phone Input */}
        {field.type === 'phone' && (
          <Input
            id={field.name}
            type="tel"
            placeholder={field.placeholder}
            error={error}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
            })}
          />
        )}

        {/* Number Input */}
        {field.type === 'number' && (
          <Input
            id={field.name}
            type="number"
            placeholder={field.placeholder}
            error={error}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
              valueAsNumber: true,
              min: field.validation?.min,
              max: field.validation?.max,
            })}
          />
        )}

        {/* Textarea */}
        {field.type === 'textarea' && (
          <Textarea
            id={field.name}
            placeholder={field.placeholder}
            error={error}
            rows={4}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
            })}
          />
        )}

        {/* Select */}
        {field.type === 'select' && field.options && (
          <Select
            id={field.name}
            options={field.options}
            error={error}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
            })}
          />
        )}

        {/* Date Input */}
        {field.type === 'date' && (
          <Input
            id={field.name}
            type="date"
            error={error}
            {...register(field.name, {
              required: field.required ? `${field.label} é obrigatório` : false,
            })}
          />
        )}

        {/* File Upload */}
        {field.type === 'file' && (
          <div>
            <Input
              id={field.name}
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              error={error}
              {...register(field.name, {
                required: field.required ? `${field.label} é obrigatório` : false,
              })}
            />
            {uploadProgress[field.name] !== undefined && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress[field.name]}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Upload: {uploadProgress[field.name]}%
                </p>
              </div>
            )}
          </div>
        )}

        {/* Helper Text */}
        {field.helperText && !error && (
          <p className="text-xs text-gray-500">{field.helperText}</p>
        )}
      </div>
    )
  }

  const handleFormSubmit = async (data: Record<string, any>) => {
    try {
      setIsSubmitting(true)
      await onSubmit(data)
      addToast({
        type: 'success',
        title: 'Formulário enviado!',
        description: 'Seus dados foram processados com sucesso',
      })
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erro ao enviar',
        description: error.message || 'Tente novamente',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {fields.map(renderField)}

      <Button
        type="submit"
        className="w-full"
        loading={isSubmitting || loading}
        disabled={isSubmitting || loading}
      >
        {isSubmitting ? 'Enviando...' : submitLabel}
      </Button>
    </form>
  )
}
