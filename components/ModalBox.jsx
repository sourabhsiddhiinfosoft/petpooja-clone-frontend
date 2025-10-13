"use client";

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
};

export function ModalBox({
  active,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = "Save",
  showFooter = true,
  size = "md", // default size
}) {
  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose} // <-- close on overlay click
    >
      <div
        className={`relative w-full max-h-[90vh] flex flex-col ${sizeClasses[size] || sizeClasses.md} rounded-md bg-white shadow-lg dark:bg-gray-800`}
        onClick={(e) => e.stopPropagation()} // <-- prevent close on modal click
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 flex-shrink-0">
          <h5
            id="modal-title"
            className="text-lg font-semibold text-gray-800 dark:text-gray-100"
          >
            {title}
          </h5>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 text-gray-700 dark:text-gray-200">
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="flex justify-end gap-3 border-t px-4 py-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Close
            </button>
            {onConfirm && (
              <button
                type="button"
                onClick={onConfirm}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
