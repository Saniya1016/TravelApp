"use client";

export default function CreateTripButton() {

    const handleAdd = async () => {
        
    }

  return (
    <button className="mt-8 bg-blue-600 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-500 hover:scale-105 transition transform duration-300"
    onClick={handleAdd}>
        + Create New Trip
    </button>
  )
}