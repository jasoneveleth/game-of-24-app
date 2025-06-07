import React, { useState, useEffect } from 'react'
import Tree from './Tree'
import exampleTree1, {
  permutations,
  cartesianPower,
  treeTypes,
  evaluate,
  construct,
  ops,
  stringify_tree,
} from './fun'

export default function ArithmeticTreeApp() {
  const [numbers, setNumbers] = useState(['', '', '', ''])
  const [foundTrees, setFoundTree] = useState([])

  const handleInputChange = (index, value) => {
    if (/^([1-9]|10)$/.test(value)) {
      const newNumbers = [...numbers]
      newNumbers[index] = value
      setNumbers(newNumbers)
    }
  }

  useEffect(() => {
    if (numbers.every((num) => num !== '')) {
      let acc = []
      for (const perm of permutations(numbers.map((x) => parseInt(x)))) {
        for (const op_list of cartesianPower(ops, 3)) {
          for (const tree_type of treeTypes) {
            const tree = construct(perm, tree_type(), op_list)
            if (evaluate(tree) === 24) {
              acc.push(tree)
            }
          }
        }
      }
      setFoundTree(acc)
    }
  }, [numbers])

  return (
    <div className="p-4 max-w-2xl my-auto mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">The Game of 24</h1>

      {/* Input Section */}
      <div className="mb-8">
        <div className="flex justify-center gap-2 mb-4">
          {numbers.map((num, i) => (
            <input
              key={i}
              type="text"
              value={num}
              onChange={(e) => handleInputChange(i, e.target.value)}
              className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded font-mono"
              placeholder="1"
              maxLength="2"
            />
          ))}
        </div>
        <p className="text-center text-gray-600">Enter 4 numbers</p>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Found Trees {foundTrees.length}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          overflowY: 'auto',
          maxHeight: '400px',
        }}>
        {foundTrees.map((tree, _) => (
          <Tree key={stringify_tree(tree)} tree={tree} />
        ))}
      </div>
    </div>
  )
}
