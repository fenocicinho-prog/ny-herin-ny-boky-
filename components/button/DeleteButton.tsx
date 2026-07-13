'use client'

export function DeleteButton({ bookId, action }: { bookId: string, action: (id: string) => Promise<any> }) {
    const handleDelete = async () => {
        if(confirm('Tena te hamafa ity boky ity ve ianao ?')){
            await action(bookId)
        }
    }
    return (
        <button onClick={handleDelete} className="flex-1 px-2 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-500 transition">

            Supprimer
        </button>

    )
}