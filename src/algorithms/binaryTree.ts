/**
 * Binary tree node.
 */
export class TreeNode {
  val: number;
  left?: TreeNode | null;
  right?: TreeNode | null;

  constructor(
    val: number | undefined,
    left?: TreeNode | null,
    right?: TreeNode | null,
  ) {
    this.val = val === undefined ? 0 : val;
    this.left = left === undefined ? null : left;
    this.right = right === undefined ? null : right;
  }

  /**
   * 深度优先遍历（先序遍历）
   */
  depthFirstTraversal(type: "recur" | "stack"): number[] {
    // 递归模式
    const recur = () => {
      let res: any[] = [];

      const dfs = (root: TreeNode | null | undefined) => {
        if (root == null) {
          return;
        }
        res.push(root.val);
        dfs(root.left);
        dfs(root.right);
      };

      dfs(this);
      return res;
    };

    // 迭代模式
    const stack = (): number[] => {
      let res: number[] = [];
      let stack: TreeNode[] = [];
      let root: TreeNode = this;

      if (root === null) {
        return [];
      }

      stack.push(root);
      while (stack.length !== 0) {
        let current = stack.pop()!;
        res.push(current?.val);
        // 右节点先入栈
        if (current.right != null) {
          stack.push(current?.right);
        }
        if (current.left != null) {
          stack.push(current?.left);
        }
      }
      return res;
    };

    return type === "recur" ? recur() : stack();
  }

  /**
   * 广度优先遍历（层序遍历）
   */
  bfs(): number[] {
    let res: number[] = [];
    let root: TreeNode = this;
    if (root == null) {
      return res;
    }

    let queue = [root];
    while (queue.length != 0) {
      let current = queue.shift()!;
      res.push(current.val);
      if (current.left != null) {
        queue.push(current.left);
      }
      if (current.right != null) {
        queue.push(current.right);
      }
    }
    return res;
  }

  /**
   * 每层节点存入一个数组的层序遍历
   */
  levelOrderTraverse(): number[][] {
    let res: number[][] = [];
    let root: TreeNode = this;
    if (root == null) {
      return res;
    }

    let queue = [root];
    while (queue.length !== 0) {
      let temp = [];
      let l = queue.length; // 记录当前层的节点数
      while (l > 0) {
        // 将下一层的节点压入队列
        let current = queue.shift()!;
        temp.push(current.val);
        if (current.left != null) {
          queue.push(current.left);
        }
        if (current.right != null) {
          queue.push(current.right);
        }
        l--;
      }
      res.push(temp);
    }
    return res;
  }

  /**
   * 后序遍历
   */
  postOrderTraverse(type: "recur" | "stack"): number[] {
    let res: number[] = [];

    // 递归方法
    const recur = () => {
      const traverse = (root: TreeNode | null | undefined) => {
        if (root == null) {
          return;
        }
        traverse(root.left);
        traverse(root.right);
        res.push(root.val);
      };
      traverse(this);
      return res;
    };

    // 迭代方法
    const stack = () => {
      let stack = [];
      let root = this;
      stack.push(root);
      while (stack.length !== 0) {
        let current: TreeNode | number = stack.pop()!;
        // 避免将空节点压入栈
        if (current === null) {
          continue;
        }
        // 颜色标记法（此处使用类型代替颜色标记）
        // Credit: https://leetcode-cn.com/problems/binary-tree-inorder-traversal/solution/
        //         yan-se-biao-ji-fa-yi-chong-tong-yong-qie-jian-ming/
        // 仅当节点未访问过（判断节点类型）时入栈
        if (current instanceof TreeNode) {
          // 按反方向入栈
          stack.push(current.val); // 压入值类型，标记为已访问
          stack.push(current.right);
          stack.push(current.left);
        } else {
          // 当节点已被访问过（类型不是节点）时出栈
          res.push(current);
        }
      }
      return res;
    };

    return type === "recur" ? recur() : stack();
  }

  /**
   * 中序遍历
   *
   * @param {String} type 遍历方法, "recur" or "stack"
   */
  inorderTraverse(type: "recur" | "stack"): number[] {
    let res: number[] = [];

    // 递归方法
    const recur = () => {
      let root: TreeNode = this;
      const traverse = (root: TreeNode | null | undefined) => {
        if (root == null) {
          return;
        }
        traverse(root.left);
        res.push(root.val);
        traverse(root.right);
      };
      traverse(root);
      return res;
    };

    // 迭代方法
    const stack = () => {
      let root: TreeNode | null | undefined = this;
      let stack: Array<TreeNode | number | null | undefined> = [root];
      while (stack.length !== 0) {
        let current = stack.pop();
        if (current == null) {
          continue;
        }
        if (current instanceof TreeNode) {
          stack.push(current.right);
          stack.push(current.val);
          stack.push(current.left);
        } else {
          res.push(current);
        }
      }
      return res;
    };

    return type === "recur" ? recur() : stack();
  }
  /**
   * Encodes a tree to an array.
   */
  serialize(): Array<"null" | number> {
    let root: TreeNode = this;
    if (root == null) {
      return [];
    }

    let queue: Array<TreeNode | null | undefined> = [root];
    let res: Array<"null" | number> = [];

    while (queue.length > 0) {
      let current: TreeNode | undefined | null = queue.shift();
      // 将null也推入队列
      if (current != null) {
        res.push(current.val);
        queue.push(current.left);
        queue.push(current.right);
      } else {
        res.push("null");
      }
    }
    while (res[res.length - 1] === "null") {
      res.pop();
    }
    return res;
  }

  /**
   * Decodes your encoded data to tree.
   */
  deserialize(nodeList: Array<"null" | number>): TreeNode | null {
    if (nodeList.length === 0) {
      return null;
    }

    let root = new TreeNode(nodeList.shift() as number);
    let queue = [root];

    // 按层序遍历顺序弹队列重建树
    while (nodeList.length > 0) {
      let currentRoot = queue.shift()!;
      let leftVal = nodeList.shift();
      let rightVal = nodeList.shift();

      if (leftVal !== "null" && leftVal !== undefined) {
        let left = new TreeNode(leftVal);
        currentRoot.left = left;
        queue.push(left);
      }
      if (rightVal !== "null" && rightVal !== undefined) {
        let right = new TreeNode(rightVal);
        currentRoot.right = right;
        queue.push(right);
      }
    }
    return root;
  }
}

export default TreeNode;

const test = () => {
  //       0
  //      / \
  //     1   2
  //    / \
  //   3   4
  //  /
  // 5
  let root = new TreeNode(0);
  let l1 = new TreeNode(1);
  let l2 = new TreeNode(2);
  let l3 = new TreeNode(3);
  let l4 = new TreeNode(4);
  let l5 = new TreeNode(5);

  root.left = l1;
  root.right = l2;
  l1.left = l3;
  l1.right = l4;
  l3.left = l5;

  let traverseRes = root.depthFirstTraversal("recur");
  console.log(traverseRes);

  let serialized = root.serialize();
  console.log(serialized.join(" "));
};

test();
