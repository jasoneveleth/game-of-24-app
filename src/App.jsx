import React, { useState, useEffect } from 'react'
import Tree from './Tree'
import {
  permutations,
  cartesianPower,
  treeTypes,
  evaluate,
  construct,
  ops,
  stringify_tree,
  same,
} from './fun'
import QRCode from 'react-qr-code'

const GOLD_NUM = 24

export default function ArithmeticTreeApp() {
  const [numbers, setNumbers] = useState(['', '', '', ''])
  const [foundTrees, setFoundTree] = useState({})
  const [showQR, setShowQR] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const PULL_THRESHOLD = 40 // pixels to pull before triggering QR

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlNumbers = [
      params.get('n1') || '',
      params.get('n2') || '',
      params.get('n3') || '',
      params.get('n4') || '',
    ]
    // Only update if URL has parameters
    if (urlNumbers.some((n) => n !== '')) {
      setNumbers(urlNumbers)
    }
  }, [])

  // Update URL when numbers change
  useEffect(() => {
    const params = new URLSearchParams()

    // Only add non-empty parameters
    numbers.forEach((num, index) => {
      if (num !== '') {
        params.set(`n${index + 1}`, num)
      }
    })

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname

    window.history.pushState(null, '', newUrl)
  }, [numbers])

  // Pull-down gesture handlers
  useEffect(() => {
    let startY = 0
    let isPullingRef = false
    let pullDistanceRef = 0

    const handleTouchStart = (e) => {
      const touch = e.touches[0]
      if (touch.clientY < 50) {
        // Only start if touch is near top
        startY = touch.clientY
        setIsPulling(true)
        isPullingRef = true
      }
    }

    const handleTouchMove = (e) => {
      if (!isPullingRef) return

      const touch = e.touches[0]
      const deltaY = touch.clientY - startY

      if (deltaY > 0) {
        pullDistanceRef = Math.min(deltaY, PULL_THRESHOLD * 1.08)
        setPullDistance(pullDistanceRef)
      }
    }

    const handleTouchEnd = () => {
      console.log('hi', isPullingRef, pullDistanceRef, PULL_THRESHOLD)
      if (isPullingRef && pullDistanceRef > PULL_THRESHOLD) {
        console.log('hi!')
        setShowQR(true)
      }
      setIsPulling(false)
      isPullingRef = false
      pullDistanceRef = 0
      setPullDistance(pullDistanceRef)
    }

    document.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // ESC key to close QR
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowQR(false)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault() // Prevent browser search
        setShowQR(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showQR])

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

  // Calculate progress for square tracing (0 to 1)
  const progress = Math.min(1, pullDistance / PULL_THRESHOLD)

  // SVG path length calculation for a 40x40 square
  const squareSize = 20
  const perimeter = squareSize * 4
  const strokeDasharray = perimeter
  const strokeDashoffset = perimeter * (1 - progress)

  return (
    <div className="relative w-full h-full">
      {/* Pull indicator with square animation */}

      {isPulling && (
        <div
          className="fixed top-0 left-0 right-0 flex flex-row items-center align-center justify-center dark:text-white text-black z-40"
          style={{
            transform: `translateY(calc(-50% + ${pullDistance / 1.8}px))`,
          }}>
          <svg
            width={squareSize}
            height={squareSize}
            viewBox={`0 0 ${squareSize} ${squareSize}`}>
            <rect
              x="2"
              y="2"
              width={squareSize - 4}
              height={squareSize - 4}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'none',
              }}
            />
          </svg>
          <p className="text-sm font-medium ml-4 dark:text-white text-black">
            Pull to reveal QR code
          </p>
        </div>
      )}

      {/* Main content with transform */}
      <div
        className="transition-transform duration-200 ease-out h-full"
        style={{
          transform: isPulling
            ? `translateY(${pullDistance}px)`
            : 'translateY(0)',
        }}>
        {/* QR Code Overlay */}
        {showQR && (
          <div
            className="fixed inset-0 bg-black/45 flex items-center justify-center z-50"
            onClick={() => setShowQR(false)}>
            <div className="text-center bg-white px-6 pt-6 pb-4 rounded-lg shadow-lg">
              <QRCode value={window.location.href} size={250} />
              <p className="text-black mt-4 text-sm">Tap anywhere to close</p>
            </div>
          </div>
        )}

        <div className="p-4">
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
                className="px-2 py-1 bg-blue-400 active:bg-blue-300 dark:bg-blue-700 dark:active:bg-blue-500 text-white rounded-lg font-medium hover:cursor-pointer">
                Done
              </button>
              <button
                onClick={clearAll}
                className="px-2 py-1 bg-red-400 active:bg-red-300 dark:bg-red-700 dark:active:bg-red-500 text-white rounded-lg font-medium hover:cursor-pointer">
                Clear
              </button>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Enter 4 numbers (type '0' for 10)
            </p>
          </div>
          <h2 className="text-xl font-semibold mb-4 text-center">
            Found {Object.values(foundTrees).flat().length} expressions, falling
            into {Object.keys(foundTrees).length} solution classes
          </h2>
          <div
            className="max-h-100 md:max-h-150"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              overflowY: 'auto',
            }}>
            {Object.keys(foundTrees).map((tree_str, i) => (
              <div
                key={tree_str}
                className="space-y-2 flex flex-col items-center justify-center">
                <h2 className="text-lg font-bold">
                  Solution {i + 1} ({foundTrees[tree_str].length} expressions)
                </h2>
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
      </div>
    </div>
  )
}
