'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseAbi } from 'viem';

const TODO_LIST_ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "newItem",
				"type": "string"
			}
		],
		"name": "addTodoItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "indexToDelete",
				"type": "uint256"
			}
		],
		"name": "deleteTodoItem",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllTodoItems",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const TODO_LIST_CONTRACT_ADDRESS = '0x37E71aa5F3E7A1C635870908EB0afc238BE68A31'; // Replace with your contract address

export default function TodoListApp() {
  const { isConnected } = useAccount();
  const [newItem, setNewItem] = useState('');

  // Read all todo items
  const {
    data: todoItems = [],
    refetch: refetchTodos,
    isLoading,
  } = useReadContract({
    abi: TODO_LIST_ABI,
    address: TODO_LIST_CONTRACT_ADDRESS,
    functionName: 'getAllTodoItems',
  });

  // Write operations
  const { writeContractAsync } = useWriteContract();

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    
    try {
      await writeContractAsync({
        abi: TODO_LIST_ABI,
        address: TODO_LIST_CONTRACT_ADDRESS,
        functionName: 'addTodoItem',
        args: [newItem],
      });
      setNewItem('');
      await refetchTodos();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (index: number) => {
    try {
      await writeContractAsync({
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
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a new task"
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <button
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-lg transition duration-200"
              >
                Add
              </button>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
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
                      Delete
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