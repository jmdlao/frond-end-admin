"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: number
  value?: number
  onValueChange?: (value: number) => void
}

interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number
  currentStep?: number
  setCurrentStep?: (step: number) => void
}

interface StepperTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  isCompleted?: boolean
  isCurrent?: boolean
  step?: number
  setCurrentStep?: (step: number) => void
  children?: React.ReactNode
}

interface StepperSeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'isCompleted'> {
  isCompleted?: boolean
}

interface StepperTitleProps extends React.HTMLAttributes<HTMLDivElement> {}
interface StepperDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}
interface StepperIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  isCompleted?: boolean
  isCurrent?: boolean
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ className, defaultValue = 1, value, onValueChange, ...props }, ref) => {
    const [mounted, setMounted] = React.useState(false)
    const [currentStep, setCurrentStep] = React.useState(value ?? defaultValue)

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      if (value !== undefined) {
        setCurrentStep(value)
      }
    }, [value])

    const handleStepChange = (step: number) => {
      setCurrentStep(step)
      onValueChange?.(step)
    }

    if (!mounted) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center w-full max-w-5xl mx-auto px-8", className)}
        {...props}
      >
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              currentStep,
              setCurrentStep: handleStepChange,
            } as Partial<StepperItemProps>)
          }
          return child
        })}
      </div>
    )
  }
)
Stepper.displayName = "Stepper"

const StepperItem = React.forwardRef<HTMLDivElement, StepperItemProps>(
  ({ className, step, currentStep, setCurrentStep, ...props }, ref) => {
    const isCompleted = step < (currentStep || 1)
    const isCurrent = step === (currentStep || 1)

    return (
      <div
        ref={ref}
        className={cn("relative flex-1 flex-col items-center min-w-[200px]", className)}
        {...props}
      >
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            if (child.type === StepperTrigger) {
              return React.cloneElement(child, {
                isCompleted,
                isCurrent,
                step,
                setCurrentStep,
              } as Partial<StepperTriggerProps>)
            } else if (child.type === StepperSeparator) {
              return React.cloneElement(child, {
                isCompleted,
              } as Partial<StepperSeparatorProps>)
            }
          }
          return child
        })}
      </div>
    )
  }
)
StepperItem.displayName = "StepperItem"

const StepperTrigger = React.forwardRef<HTMLButtonElement, StepperTriggerProps>(
  ({ className, isCompleted, isCurrent, step, setCurrentStep, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-col items-center gap-3 w-full",
          className
        )}
        onClick={() => step && setCurrentStep && setCurrentStep(step)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
StepperTrigger.displayName = "StepperTrigger"

const StepperIndicator = React.forwardRef<HTMLDivElement, StepperIndicatorProps>(
  ({ className, isCompleted, isCurrent, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center rounded-full border-2 h-8 w-8 text-base font-medium transition-colors",
          isCompleted
            ? "border-[#DF5C5D] bg-[#DF5C5D] text-white"
            : isCurrent
            ? "border-[#DF5C5D] text-[#DF5C5D] bg-[#DF5C5D]/10"
            : "border-muted-foreground/25 text-muted-foreground/25",
          className
        )}
        {...props}
      >
        {isCompleted ? (
          <Check className="h-4 w-4" />
        ) : (
          props.children
        )}
      </div>
    )
  }
)
StepperIndicator.displayName = "StepperIndicator"

const StepperTitle = React.forwardRef<HTMLDivElement, StepperTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-base font-medium text-center", className)}
        {...props}
      />
    )
  }
)
StepperTitle.displayName = "StepperTitle"

const StepperDescription = React.forwardRef<HTMLDivElement, StepperDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("text-sm text-muted-foreground text-center", className)}
        {...props}
      />
    )
  }
)
StepperDescription.displayName = "StepperDescription"

const StepperSeparator = React.forwardRef<HTMLDivElement, StepperSeparatorProps>(
  ({ className, isCompleted, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-4 left-[calc(50%+1.75rem)] w-[calc(100%-3.5rem)] h-0.5",
          isCompleted ? "bg-[#DF5C5D]" : "bg-muted-foreground/25",
          className
        )}
        {...props}
      />
    )
  }
)
StepperSeparator.displayName = "StepperSeparator"

export {
  Stepper,
  StepperItem,
  StepperTrigger,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperIndicator,
} 