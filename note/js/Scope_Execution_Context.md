# JavaScript基础 - 作用域和执行上下文

## 作用域

作用域是指程序源代码中定义变量的区域。

作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。

JavaScript 采用词法作用域(lexical scoping)，也就是静态作用域，函数的作用域在函数定义的时候就决定了。

### 自由变量

当前作用域没有定义的变量称为自由变量。

对于自由变量，它的值要到创建这个函数的那个域中获取，而不是实际调用时的作用域。举例如下：

```js
var x = 10;
function fn() {
  console.log(x);
}
function show(f) {
  var x = 20(function () {
    f(); //10，而不是20
  })();
}
show(fn);
```

该例中，函数 fn 创建时的作用域包含了`var x = 10;`，调用 fn 时，到 fn 定义时的作用域，也就是全局作用域中找变量 x ，而不是在运行时的作用域中寻找。

## 作用域链

作用域链，是由当前环境与上层环境的一系列作用域共同组成，它保证了当前执行环境对符合访问权限的变量和函数的有序访问。

在函数执行过程中，每遇到一个变量，都会经历一次标识符解析过程，以决定从哪里获取和存储数据。

该过程从作用域链头部，也就是当前执行函数的作用域开始，查找同名的标识符，如果找到了就返回这个标识符对应的值，如果没找到继续搜索作用域链中的下一个作用域，如果搜索完所有作用域都未找到，则认为该标识符未定义。

## 执行上下文

JavaScript 中有三种执行上下文类型。

- 全局执行上下文：这是默认或者说基础的上下文，任何不在函数内部的代码都在全局上下文中。它会执行两件事：创建一个全局的 window 对象（浏览器的情况下），并且设置 this 的值等于这个全局对象。一个程序中只会有一个全局执行上下文。
- 函数执行上下文：每当一个函数被调用时, 都会为该函数创建一个新的上下文。每个函数都有它自己的执行上下文，不过是在函数被调用时创建的。函数上下文可以有任意多个。每当一个新的执行上下文被创建，它会按定义的顺序（将在后文讨论）执行一系列步骤。
- Eval 函数执行上下文：执行在 eval 函数内部的代码也会有它属于自己的执行上下文

另一个概念是执行栈，用来保存代码运行时所有的执行上下文。

## 关于 setTimeout

在循环中运行`setTimeout`会向宏任务队列中加入多个计时器，但是这几个计时器是同时计时的，在计时结束后运行传入的回调。下例中的代码会在一秒后按序同时输出三个数字

```js
function closure(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      console.log("i = " + i);
    }, 1000);
  }
}

closure(3); // 0, 1, 2
```

因此如果想实现每隔一秒钟输出一个数字的效果，应该让多个计时器的倒数时间相差1秒。如下例

```js
function closure(n) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      console.log("i = " + i);
    }, 1000 * i);
  }
}

closure(3); // 0, 1, 2
```

需要注意的是，由于`var`关键词声明的变量没有块级作用域，因此以下代码会输出三个相同的数字。这里的`i`是函数作用域，每个回调中绑定的是同一个变量。

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, i * 1000);
}
// 3, 3, 3
```

循环结束时，`i`已经变成了 3 ，且三个计时器引用了同一个全局变量，因此输出3个3。而使用`let`声明的`i`，由于闭包机制被保存到了三个不同的闭包中，三个不同的变量互不干扰。

**注意**，如果在`let` 例子中，将`let i = 0`声明提升到循环外部，则结果会是每隔一秒输出一个`3`，原因同 var 的例子

参见：[Why let and var bindings behave differently using setTimeout function?](https://stackoverflow.com/questions/31285911/why-let-and-var-bindings-behave-differently-using-settimeout-function)

### for 循环的变量声明作用域

继续上文，输出不同本质是ECMAScript对 for 循环的规定：每次迭代都会创建新的词法环境，将上一轮的循环变量值初始化到新的绑定中。

如下面例子所示

```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
// prints "0 1 2" — as expected

let i = 0;
for (i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
// prints "3 3 3" — what?
```

根据 ECMAScript 规范，当使用 let 在 for 循环的初始化部分声明变量时，JS 引擎会为每次迭代创建新的词法环境。

第一种在for循环内声明变量 i 然后让 setTimeout 调用，类似以下的效果

```js
{
  let i = 0;
  setTimeout(() => console.log(i));
}
{
  let i = 1;
  setTimeout(() => console.log(i));
}
{
  let i = 2;
  setTimeout(() => console.log(i));
}
```

结果自然是依次输出 1, 2, 3

而在第二种中，所有的 setTimeout 都共享同一个 i ，循环结束时候 i 被更新为 3，三个 setTimeout 都引用这同一个值，输出了三个 3

参考：[On JavaScript's Weirdness](https://www.hexclave.com/blog/on-javascripts-weirdness)
