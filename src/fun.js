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

const exampleTree2 = Node(
  Node(undefined, 1, undefined),
  ADD,
  Node(Node(undefined, 2, undefined), MUL, Node(4, POW, 5)),
)

const range = (n) => Array.from({ length: n }, (_, i) => i)

function* multisets(set, k) {
  let n = set.length
  for (const stars of combinations(range(n - 1 + k), k)) {
    let nbars_seen = 0
    const res = []
    // look through stars and bars, pick elements from the set
    for (const i of range(n - 1 + k)) {
      if (stars.includes(i)) {
        res.push(set[nbars_seen])
      } else {
        nbars_seen++
      }
    }
    yield res
  }
}

function* combinations(set, k) {
  if (k === 0) {
    yield []
    return
  }
  if (k > set.length) {
    return
  }

  for (let i = 0; i <= set.length - k; i++) {
    const first = set[i]
    const rest = set.slice(i + 1)
    for (const combo of combinations(rest, k - 1)) {
      yield [first, ...combo]
    }
  }
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

function same(a, b) {
  const isleaf = (t) => t.left === undefined && t.right === undefined
  if (
    evaluate(a) !== evaluate(b) ||
    isleaf(a) !== isleaf(b) ||
    a.val !== b.val
  ) {
    return false
  }

  const same_children = (x, y) => {
    return same(x.left, y.left) && same(x.right, y.right)
  }

  if (isleaf(a)) {
    return true
  } else if (same_children(a, b)) {
    return true
  } else if ([ADD, MUL].includes(a.val)) {
    // comm, associative
    return (
      same_children(mirror(a), b) ||
      (a.left.val === a.val && same_children(rrotate(a), b)) ||
      (a.right.val === a.val && same_children(lrotate(a), b))
    )
  }
  return false
}

function Node(left, val, right) {
  return { val, left, right }
}

function mirror(tree) {
  return {
    val: tree.val,
    left: tree.right,
    right: tree.left,
  }
}

/*
before:
  x             y
 / \           / \
l   y   <->   x   r
   / \       / \
  m   r     l   m
*/
function lrotate(tree) {
  if (!tree.right.left || !tree.right.right) {
    return tree
  }
  const x = tree.val
  const l = tree.left
  const { left: m, val: y, right: r } = tree.right

  return Node(Node(l, x, m), y, r)
}

function rrotate(tree) {
  if (!tree.left.left || !tree.left.right) {
    return tree
  }
  const y = tree.val
  const { left: l, val: x, right: m } = tree.left
  const r = tree.right

  return Node(l, x, Node(m, y, r))
}

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
  multisets,
}
