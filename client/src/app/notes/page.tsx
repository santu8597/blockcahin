'use client';
import { useState,useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract,useWaitForTransactionReceipt } from 'wagmi';
import {Loader2,DeleteIcon} from 'lucide-react'
import {abi,contract_adress} from '@/abi/note'
import { useQueryClient } from "@tanstack/react-query"
import { Button } from '@/components/ui/button';
// import { handleAddItem } from './action';
const TODO_LIST_ABI =abi 

const TODO_LIST_CONTRACT_ADDRESS = contract_adress// Replace with your contract address

export default function TodoListApp() {
  const { isConnected } = useAccount();
  const [newItem, setNewItem] = useState('');
  const queryClient = useQueryClient()
  

  // Read all todo items
  const { data: todoItems = [], refetch: refetchTodos, isLoading} = useReadContract({
    abi: TODO_LIST_ABI,
    address: TODO_LIST_CONTRACT_ADDRESS,
    functionName: 'getAllTodoItems',
    query: {
      select: (data: unknown) => data as string[],
    }
  });
  
  // Write operations
  const { writeContract, isPending, data: hash } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })
  useEffect(() => {
    if (isSuccess) {
      queryClient.invalidateQueries({
        queryKey: ['readContract', { functionName: 'getAllTodoItems' }]
      })
    }
  }, [isSuccess, queryClient])

  const handleAddItem = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    try {
       writeContract({
        abi: TODO_LIST_ABI,
        address: TODO_LIST_CONTRACT_ADDRESS,
        functionName: 'addTodoItem',
        args: [newItem],
      });
      // revalidatePath('/');
      setNewItem('');
        // Revalidate the page to fetch updated data
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (index: number) => {
    try {
       writeContract({
        abi: TODO_LIST_ABI,
        address: TODO_LIST_CONTRACT_ADDRESS,
        functionName: 'deleteTodoItem',
        args: [BigInt(index)],
      });
      await refetchTodos();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Todo List</h1>
        
        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Please connect your wallet to interact with the Todo List</p>
          </div>
        ) : (
          <>
            <div className="flex mb-4">
            <form onSubmit={handleAddItem}>
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a new task"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                
              />
              <Button type="submit" className="ml-2" disabled={isPending || isConfirming}>
                  {isPending || isConfirming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Add"
                  )}
                </Button>
              </form>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <p className="text-gray-600">Loading todos...</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {todoItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-800">{item}</span>
                    <button
                      onClick={() => handleDeleteItem(index)}
                      className="text-red-500 hover:text-red-700 transition duration-200"
                    >
                      <DeleteIcon className="mr-2 h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {todoItems.length === 0 && !isLoading && (
              <div className="text-center py-4">
                <p className="text-gray-600">No todo items yet. Add one above!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}