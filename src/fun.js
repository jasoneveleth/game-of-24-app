const ADD = '+'
const MUL = '×'
const POW = '^'
const SUB = '-'
const DIV = '÷'

const exampleTree1 = {
  val: ADD,
  left: { val: 1 },
  right: {
    val: MUL,
    left: { val: 2 },
    right: {
      val: POW,
      left: { val: 4 },
      right: { val: 5 },
    },
  },
}

function* permutations(set) {
  if (set.length === 0) {
    yield []
    return
  }

  for (let i = 0; i < set.length; i++) {
    const rest = [...set.slice(0, i), ...set.slice(i + 1)]
    for (const perm of permutations(rest)) {
      yield [set[i], ...perm]
    }
  }
}

function* cartesianPower(set, n) {
  if (n === 0) {
    yield []
    return
  }

  for (const x of set) {
    for (const product of cartesianPower(set, n - 1)) {
      yield [x, ...product]
    }
  }
}

function evaluate(tree) {
  if (tree.left === undefined && tree.right === undefined) {
    return tree.val
  }

  const leftValue = evaluate(tree.left)
  const rightValue = evaluate(tree.right)
  switch (tree.val) {
    case ADD:
      return leftValue + rightValue
    case SUB:
      return leftValue - rightValue
    case MUL:
      return leftValue * rightValue
    case DIV:
      return leftValue / rightValue
    case POW:
      return Math.pow(leftValue, rightValue)
    default:
      throw new Error(`Unknown operator: ${tree.val}`)
  }
}

function construct(leafs, tree_type, ops) {
  let i = 0
  let j = 0

  for (const [f, is_child] of in_order_traversal(tree_type)) {
    const val = is_child ? leafs[j++] : ops[i++]
    f(val)
  }
  return tree_type
}

function* in_order_traversal(tree) {
  if (tree === undefined) return
  yield* in_order_traversal(tree.left)
  const is_child = tree.left === undefined && tree.right === undefined
  yield [(x) => (tree.val = x), is_child]
  yield* in_order_traversal(tree.right)
}

function same(a_tree, b_tree) {}

const treeTypes2 = [
  [
    [0, 0],
    [0, 0],
  ],
  [0, [[0, 0], 0]],
  [0, [0, [0, 0]]],
  [[[0, 0], 0], 0],
  [[0, [0, 0]], 0],
]
function construct2(arr) {
  if (arr === 0) {
    return { val: 0 }
  }
  return {
    val: 9,
    left: construct2(arr[0]),
    right: construct2(arr[1]),
  }
}
const treeTypes = treeTypes2.map((x) => () => construct2(x))

const ops = [ADD, SUB, MUL, DIV, POW]

function stringify_tree(tree) {
  if (tree.left === undefined && tree.right === undefined) {
    return tree.val.toString()
  }
  return `(${stringify_tree(tree.left)} ${tree.val} ${stringify_tree(tree.right)})`
}

export default exampleTree1
export {
  permutations,
  cartesianPower,
  evaluate,
  same,
  construct,
  treeTypes,
  stringify_tree,
  ops,
}
