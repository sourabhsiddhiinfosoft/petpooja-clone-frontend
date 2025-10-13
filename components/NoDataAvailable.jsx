export const NoDataAvailableCard = () => {
    return (
        <div>
            <div class="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-lg shadow-md dark:bg-neutral-800 dark:border-neutral-700">
                <svg class="w-12 h-12 text-gray-400 mb-4 dark:text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-700 mb-2 dark:text-neutral-300">No Data Available</h3>

            </div>
        </div>
    )
}