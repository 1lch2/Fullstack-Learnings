import "./Modal.css";

export interface SampleComponentProps {
  title: string;
  onClose?: () => void;
}

/**
 * 简易 Modal 组件：遮罩层 + 居中卡片，含标题、内容、底部操作按钮。
 * 点击遮罩、关闭按钮或底部按钮均会触发 onClose 回调。
 */
export function Modal({ title, onClose }: SampleComponentProps) {
  return (
    <div className="container" onClick={onClose}>
      {/* 阻止点击卡片冒泡到遮罩层，避免误触发关闭 */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <span>{title}</span>
          <button onClick={onClose}>×</button>
        </header>
        <p>这是一个简易 Modal 示例组件。</p>
        <footer>
          <button onClick={onClose}>取消</button>
          <button onClick={onClose}>确认</button>
        </footer>
      </div>
    </div>
  );
}
