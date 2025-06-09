import {
  permutations,
  cartesianPower,
  treeTypes,
  evaluate,
  construct,
  ops,
  stringify_tree,
  same,
  multisets,
} from './fun.js'

const GOLD_NUM = 24

// run for ad-hoc analysis

function range_incl(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start)
}

function main() {
  console.log('cards_0_is_10,n_exprs,n_classes')
  for (const cards of multisets(range_incl(1, 10), 4)) {
    let acc = {}
    let set = new Set() // to avoid duplicate permutations from non-unique input
    for (const perm of permutations(cards)) {
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
    const n_exprs = Object.values(acc).flat().length
    const n_classes = Object.keys(acc).length
    const cards_str = cards.map((n) => (n == 10 ? 0 : n)).join('')
    console.log(`${cards_str},${n_exprs},${n_classes}`)
  }
}

main()
