// 给你两棵二叉树： root1 和 root2 。
// 想象一下，当你将其中一棵覆盖到另一棵之上时，两棵树上的一些节点将会重叠（而另一些不会）。
// 你需要将这两棵树合并成一棵新二叉树。
// 合并的规则是：如果两个节点重叠，那么将这两个节点的值相加作为合并后节点的新值；
// 否则，不为 null 的节点将直接作为新二叉树的节点。
// 返回合并后的二叉树。

import TreeNode from "../../algorithms/binaryTree.js";

// 注意: 合并过程必须从两个树的根节点开始。

// 示例 1：
//       1             2                    3
//      / \           / \                  / \
//     3   2    +    1   3       ->       4   5
//   /                \   \              / \   \
//  5                  4   7            5   4   7

// 输入：root1 = [1,3,2,5], root2 = [2,1,3,null,4,null,7]
// 输出：[3,4,5,5,4,null,7]

// 提示：
// 两棵树中的节点数目在范围 [0, 2000] 内
// -10^4 <= Node.val <= 10^4

function mergeTrees(
  root1: TreeNode | null,
  root2: TreeNode | null,
): TreeNode | null {
  let temp1 = root1;
  let temp2 = root2;

  const dfs = (
    root1: TreeNode | null | undefined,
    root2: TreeNode | null | undefined,
  ) => {
    // 结束条件为任一节点为空，则返回一个不为空的作为当前子树的根
    if (root1 == null) {
      return root2;
    }
    if (root2 == null) {
      return root1;
    }

    const root = new TreeNode(root1.val + root2.val, null, null);
    root.left = dfs(root1.left, root2.left);
    root.right = dfs(root1.right, root2.right);
    return root;
  };

  return dfs(temp1, temp2) as TreeNode | null;
}
