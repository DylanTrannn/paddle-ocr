import type { OcrBatchItem } from "@paddle-ocr/shared";

type Props = {
  item: OcrBatchItem;
  defaultOpen?: boolean;
};

export function OcrResultCard({ item, defaultOpen = false }: Props) {
  const hasError = Boolean(item.error);
  const lineCount = item.result?.lines.length ?? 0;

  return (
    <details className={`result-card ${hasError ? "result-card--error" : ""}`} open={defaultOpen}>
      <summary className="result-card__summary">
        <span className="result-card__name">{item.fileName}</span>
        <span className={`result-card__badge ${hasError ? "result-card__badge--error" : ""}`}>
          {hasError ? "Failed" : `${lineCount} line${lineCount === 1 ? "" : "s"}`}
        </span>
      </summary>

      {hasError ? (
        <p className="result-card__error">{item.error!.error}</p>
      ) : (
        <div className="result-card__body">
          <pre className="result-card__text">{item.result?.text || "(empty)"}</pre>
          {lineCount > 0 && (
            <ul className="result-card__lines">
              {item.result!.lines.map((line, i) => (
                <li key={i}>
                  <span>{line.text}</span>
                  {line.box != null && (
                    <span className="result-card__meta">
                      {line.box.width}×{line.box.height} at ({line.box.x}, {line.box.y})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </details>
  );
}
