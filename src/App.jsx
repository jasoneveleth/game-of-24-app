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
  same,
} from './fun'

const GOLD_NUM = 24

export default function ArithmeticTreeApp() {
  const [numbers, setNumbers] = useState(['', '', '', ''])
  const [foundTrees, setFoundTree] = useState({})

  const handleClick = (index) => {
    const input = document.querySelector(`input[data-index="${index}"]`)
    input?.focus()
    input?.setSelectionRange(0, input?.value.length)
  }

  const handleDone = () => {
    for (let i = 0; i < numbers.length; i++) {
      document.querySelector(`input[data-index="${i}"]`).blur()
    }
  }

  const handleInputChange = (index, arg) => {
    const value = arg === '0' ? '10' : arg
    if (/^(|[1-9]|10)$/.test(value)) {
      const newNumbers = [...numbers]
      newNumbers[index] = value
      setNumbers(newNumbers)
      const nextInput = document.querySelector(
        `input[data-index="${index + 1}"]`,
      )
      if (/^([1-9]|10)$/.test(value) && nextInput) {
        nextInput?.focus()
        nextInput?.setSelectionRange(0, nextInput?.value.length)
      } else if (index == 3) {
        document.querySelector(`input[data-index="${index}"]`).blur()
      }
    }
  }

  const clearAll = () => {
    setNumbers(Array(numbers.length).fill(''))
    const firstInput = document.querySelector(`input[data-index="0"]`)
    firstInput?.focus()
    firstInput?.setSelectionRange(0, 0)
  }

  useEffect(() => {
    if (numbers.every((num) => num !== '')) {
      let acc = {}
      let set = new Set() // to avoid duplicate permutations from non-unique input
      for (const perm of permutations(numbers.map((x) => parseInt(x)))) {
        for (const op_list of cartesianPower(ops, 3)) {
          for (const tree_type of treeTypes) {
            const tree = construct(perm, tree_type(), op_list)
            if (evaluate(tree) === GOLD_NUM && !set.has(stringify_tree(tree))) {
              set.add(stringify_tree(tree))
              const match = Object.keys(acc).find((x) => same(acc[x][0], tree))
              if (match === undefined) {
                acc[stringify_tree(tree)] = [tree]
              } else {
                acc[match].push(tree)
              }
            }
          }
        }
      }
      setFoundTree(acc)
    } else {
      setFoundTree({})
    }
  }, [numbers])

  return (
    <div className="p-4 max-w-2xl my-auto mx-auto">
      <h1 className="text-5xl leading-tight font-bold mb-6 text-center">
        The Game of {GOLD_NUM}
      </h1>
      <div className="mb-8">
        <div className="flex justify-center gap-2 mb-4">
          {numbers.map((num, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={num}
              onChange={(e) => handleInputChange(i, e.target.value)}
              onClick={() => handleClick(i)}
              className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded font-mono cursor-pointer"
              placeholder="?"
              maxLength="2"
              data-index={i}
            />
          ))}
          <button
            onClick={handleDone}
            className="px-2 py-1 bg-blue-400 text-white rounded-lg font-medium">
            Done
          </button>
          <button
            onClick={clearAll}
            className="px-2 py-1 bg-red-400 text-white rounded-lg font-medium">
            Clear
          </button>
        </div>
        <p className="text-center text-gray-600">
          Enter 4 numbers (type '0' for 10)
        </p>
      </div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Found Unique Trees {Object.keys(foundTrees).length}, Total:
        {Object.values(foundTrees).flat().length}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1rem',
          overflowY: 'auto',
          maxHeight: '600px',
        }}>
        {Object.keys(foundTrees).map((tree_str, i) => (
          <div
            key={tree_str}
            className="space-y-2 flex flex-col items-center justify-center">
            <h2 className="text-lg font-bold">Solution {i + 1}</h2>
            <Tree tree={foundTrees[tree_str][0]} />
            <div className="grid grid-cols-2 gap-x-6">
              {foundTrees[tree_str].map((tree, j) => (
                <p key={j}>{stringify_tree(tree)}</p>
              ))}
            </div>
            <hr className="border w-full border-gray-300 my-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
