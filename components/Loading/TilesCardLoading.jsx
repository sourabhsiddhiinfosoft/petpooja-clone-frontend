export const TilesCardLoading = ({ columns = 3 }) => {
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(columns)].map((_, index) => (
                    <div key={`tileLoading-${index}`} className="bg-white rounded-lg shadow p-6">
                        <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-2.5"></div>
                        <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-28 mb-4"></div>
                    </div>
                ))
                }
            </div>
        </div>
    )
}