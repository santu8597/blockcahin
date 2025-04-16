export const contract_adress="0x37E71aa5F3E7A1C635870908EB0afc238BE68A31"
export const abi=[
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