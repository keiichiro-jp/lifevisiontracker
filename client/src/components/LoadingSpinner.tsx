import { motion } from "framer-motion";

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
}

export default function LoadingSpinner({ 
  message = "Processing your answers", 
  submessage = "Our AI is analyzing your responses to create your personalized life vision."
}: LoadingSpinnerProps) {
  return (
    <div className="py-16 flex flex-col items-center justify-center">
      <div className="mb-8">
        <svg 
          className="animate-spin h-10 w-10 text-primary" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{message}</h3>
      <p className="text-gray-600 text-center max-w-xs">{submessage}</p>
      
      <div className="mt-8 space-y-2 w-64">
        <motion.div 
          className="h-3 bg-gray-200 rounded"
          animate={{
            width: ["100%", "80%", "100%"],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        <motion.div 
          className="h-3 bg-gray-200 rounded"
          animate={{
            width: ["80%", "100%", "60%", "80%"],
            transition: {
              duration: 2.5,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
        <motion.div 
          className="h-3 bg-gray-200 rounded"
          animate={{
            width: ["60%", "80%", "40%", "60%"],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        />
      </div>
    </div>
  );
}
