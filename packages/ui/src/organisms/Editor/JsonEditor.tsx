import React, { useState } from "react";
import { Icon } from "../../atoms/Icons";
import "./Editor.css";

type JsonType = "string" | "number" | "boolean" | "object" | "array" | "null";

function getTypeOf(value: any): JsonType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value as JsonType;
}

export interface JsonEditorProps {
  /** The value to edit */
  value: any;
  /** Callback triggered when any part of the JSON changes */
  onChange?: (value: any) => void;
  /** "tree" for full JSON support, "kv" for flat object strict mode */
  mode?: "tree" | "kv";
  /** Visual theme */
  variant?: "dark" | "light" | "minimal";
  /** Read only flag */
  readOnly?: boolean;
  /** Show toolbar with toggle for Raw JSON file editing */
  showRawToggle?: boolean;
  className?: string;
}

/**
 * Helper to update deep paths in an object immutably.
 * path is an array of string/number keys.
 */
function updateDeep(obj: any, path: (string | number)[], newValue: any): any {
  if (path.length === 0) return newValue;

  const [current, ...rest] = path;
  if (Array.isArray(obj)) {
    const nextArr = [...obj];
    nextArr[current as number] = updateDeep(obj[current as number], rest, newValue);
    return nextArr;
  } else if (obj !== null && typeof obj === "object") {
    const nextObj = { ...obj };
    nextObj[current as string] = updateDeep(obj[current as string], rest, newValue);
    return nextObj;
  }
  return obj;
}

/**
 * Helper to delete deep paths immutably.
 */
function deleteDeep(obj: any, path: (string | number)[]): any {
  if (path.length === 0) return obj;

  const [current, ...rest] = path;
  if (rest.length === 0) {
    if (Array.isArray(obj)) {
      const nextArr = [...obj];
      nextArr.splice(current as number, 1);
      return nextArr;
    } else {
      const nextObj = { ...obj };
      delete nextObj[current as string];
      return nextObj;
    }
  }

  if (Array.isArray(obj)) {
    const nextArr = [...obj];
    nextArr[current as number] = deleteDeep(obj[current as number], rest);
    return nextArr;
  } else {
    const nextObj = { ...obj };
    nextObj[current as string] = deleteDeep(obj[current as string], rest);
    return nextObj;
  }
}

/**
 * Helper to rename object keys immutably.
 */
function renameKeyDeep(obj: any, path: (string | number)[], oldKey: string, newKey: string): any {
  if (path.length === 0) {
    if (Array.isArray(obj)) return obj;
    const nextObj: any = {};
    for (const k of Object.keys(obj)) {
      if (k === oldKey) {
        nextObj[newKey] = obj[k];
      } else {
        nextObj[k] = obj[k];
      }
    }
    return nextObj;
  }
  const [current, ...rest] = path;
  if (Array.isArray(obj)) {
    const nextArr = [...obj];
    nextArr[current as number] = renameKeyDeep(obj[current as number], rest, oldKey, newKey);
    return nextArr;
  } else {
    const nextObj = { ...obj };
    nextObj[current as string] = renameKeyDeep(obj[current as string], rest, oldKey, newKey);
    return nextObj;
  }
}

interface JsonNodeProps {
  nodeKey: string | number;
  nodeValue: any;
  path: (string | number)[];
  isRoot?: boolean;
  mode: "tree" | "kv";
  readOnly: boolean;
  onUpdate: (path: (string | number)[], val: any) => void;
  onDelete: (path: (string | number)[]) => void;
  onRenameKey: (path: (string | number)[], oldKey: string, newKey: string) => void;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  nodeKey,
  nodeValue,
  path,
  isRoot = false,
  mode,
  readOnly,
  onUpdate,
  onDelete,
  onRenameKey,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const type = getTypeOf(nodeValue);
  const isObject = type === "object";
  const isArray = type === "array";
  const isComplex = isObject || isArray;

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextType = e.target.value as JsonType;
    let nextVal: any = "";
    if (nextType === "number") nextVal = 0;
    if (nextType === "boolean") nextVal = false;
    if (nextType === "object") nextVal = {};
    if (nextType === "array") nextVal = [];
    if (nextType === "null") nextVal = null;
    onUpdate(path, nextVal);
  };

  const handleAddChild = () => {
    if (isObject) {
      // Find a unique key
      let newKey = "newKey";
      let count = 1;
      while (nodeValue[newKey] !== undefined) {
        newKey = `newKey${count}`;
        count++;
      }
      onUpdate([...path, newKey], "");
    } else if (isArray) {
      onUpdate([...path, nodeValue.length], "");
    }
    setCollapsed(false);
  };

  return (
    <div className="bs-json-node">
      <div className="bs-json-node-row">
        {/* Collapse Toggle */}
        <div className="bs-json-node-collapse-col">
          {isComplex && !isRoot && (
            <button
              type="button"
              className="bs-json-btn-icon"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand" : "Collapse"}
            >
              <Icon name={collapsed ? "ChevronRight" : "ChevronDown"} size={14} />
            </button>
          )}
        </div>

        {/* Key Editor (only editable if parent is object and not root) */}
        {!isRoot && (
          <div className="bs-json-node-key-col">
            {typeof nodeKey === "number" ? (
              <span className="bs-json-index">{nodeKey}</span>
            ) : (
              <input
                type="text"
                className="bs-json-input bs-json-input--key"
                value={nodeKey}
                readOnly={readOnly}
                onChange={(e) => {
                  const parentPath = path.slice(0, -1);
                  onRenameKey(parentPath, nodeKey as string, e.target.value);
                }}
              />
            )}
            <span className="bs-json-colon">:</span>
          </div>
        )}

        {/* Type Selector (hidden for KV root mode, visible otherwise unless KV forces primitives) */}
        {!isRoot && mode === "tree" && (
          <select
            className="bs-json-type-select"
            value={type}
            disabled={readOnly}
            onChange={handleTypeChange}
          >
            <option value="string">String</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
            <option value="null">Null</option>
          </select>
        )}

        {/* Value Editor (Primitives) */}
        {!isComplex && (
          <div className="bs-json-node-val-col">
            {type === "boolean" ? (
              <input
                type="checkbox"
                className="bs-json-checkbox"
                checked={nodeValue as boolean}
                disabled={readOnly}
                onChange={(e) => onUpdate(path, e.target.checked)}
              />
            ) : type === "null" ? (
              <span className="bs-json-null">null</span>
            ) : type === "number" ? (
              <input
                type="number"
                className="bs-json-input bs-json-input--val"
                value={nodeValue}
                readOnly={readOnly}
                onChange={(e) => onUpdate(path, Number(e.target.value))}
              />
            ) : (
              <input
                type="text"
                className="bs-json-input bs-json-input--val"
                value={nodeValue || ""}
                readOnly={readOnly}
                onChange={(e) => onUpdate(path, e.target.value)}
              />
            )}
          </div>
        )}

        {/* Complex Type Label */}
        {isComplex && !isRoot && (
          <span className="bs-json-complex-label">
            {isArray ? `Array [${nodeValue.length}]` : `Object {${Object.keys(nodeValue).length}}`}
          </span>
        )}

        {/* Action Controls */}
        <div className="bs-json-node-actions">
          {isComplex && !readOnly && (!isRoot || mode === "tree") && (
            <button
              type="button"
              className="bs-json-btn-icon bs-json-btn-icon--add"
              onClick={handleAddChild}
              title="Add property"
            >
              <Icon name="Plus" size={14} />
            </button>
          )}
          {!isRoot && !readOnly && (
            <button
              type="button"
              className="bs-json-btn-icon bs-json-btn-icon--del"
              onClick={() => onDelete(path)}
              title="Delete node"
            >
              <Icon name="Trash2" size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Children Recursion */}
      {isComplex && !collapsed && (
        <div className={isRoot ? "bs-json-children--root" : "bs-json-children"}>
          {isArray
            ? nodeValue.map((child: any, idx: number) => (
                <JsonNode
                  key={idx}
                  nodeKey={idx}
                  nodeValue={child}
                  path={[...path, idx]}
                  mode={mode}
                  readOnly={readOnly}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onRenameKey={onRenameKey}
                />
              ))
            : Object.keys(nodeValue).map((k) => (
                <JsonNode
                  key={k}
                  nodeKey={k}
                  nodeValue={nodeValue[k]}
                  path={[...path, k]}
                  mode={mode}
                  readOnly={readOnly}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onRenameKey={onRenameKey}
                />
              ))}
        </div>
      )}
    </div>
  );
};


export function JsonEditor({
  value,
  onChange,
  mode = "tree",
  variant = "dark",
  readOnly = false,
  showRawToggle = true,
  className = "",
}: JsonEditorProps) {
  const [viewMode, setViewMode] = useState<"visual" | "raw">("visual");
  const [rawText, setRawText] = useState("");
  const [rawError, setRawError] = useState<string | null>(null);

  // Ensure we are working with an object or array at the root
  const rootType = getTypeOf(value);
  const isRootComplex = rootType === "object" || rootType === "array";
  const rootValue = isRootComplex ? value : mode === "kv" ? {} : value;

  const handleUpdate = (path: (string | number)[], val: any) => {
    if (!onChange) return;
    onChange(updateDeep(rootValue, path, val));
  };

  const handleDelete = (path: (string | number)[]) => {
    if (!onChange) return;
    onChange(deleteDeep(rootValue, path));
  };

  const handleRenameKey = (path: (string | number)[], oldKey: string, newKey: string) => {
    if (!onChange || oldKey === newKey || newKey.trim() === "") return;
    onChange(renameKeyDeep(rootValue, path, oldKey, newKey));
  };

  const handleSwitchToRaw = () => {
    setRawText(JSON.stringify(rootValue, null, 2));
    setRawError(null);
    setViewMode("raw");
  };

  const handleSwitchToVisual = () => {
    try {
      const parsed = JSON.parse(rawText);
      if (onChange) onChange(parsed);
      setRawError(null);
      setViewMode("visual");
    } catch (err: any) {
      setRawError("Invalid JSON: " + err.message);
    }
  };

  const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setRawText(text);
    try {
      const parsed = JSON.parse(text);
      setRawError(null);
      if (onChange) onChange(parsed);
    } catch (err: any) {
      setRawError("Invalid JSON format");
    }
  };

  return (
    <div
      className={["bs-json-editor", `bs-json-editor--${variant}`, className].filter(Boolean).join(" ")}
    >
      {showRawToggle && (
        <div className="bs-json-header-toolbar">
          <div className="bs-json-toggle-group">
            <button
              type="button"
              className={["bs-json-toggle-btn", viewMode === "visual" ? "bs-json-toggle-btn--active" : ""].filter(Boolean).join(" ")}
              onClick={() => {
                if (viewMode === "raw") handleSwitchToVisual();
              }}
            >
              Visual {mode === "kv" ? "KV Grid" : "Tree"}
            </button>
            <button
              type="button"
              className={["bs-json-toggle-btn", viewMode === "raw" ? "bs-json-toggle-btn--active" : ""].filter(Boolean).join(" ")}
              onClick={handleSwitchToRaw}
            >
              Raw File
            </button>
          </div>
          {rawError && viewMode === "raw" && (
            <span style={{ color: "#F43F5E", fontSize: 11, fontWeight: 500 }}>{rawError}</span>
          )}
        </div>
      )}

      <div className="bs-json-body">
        {viewMode === "visual" ? (
          <JsonNode
            isRoot={true}
            nodeKey="root"
            nodeValue={rootValue}
            path={[]}
            mode={mode}
            readOnly={readOnly}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onRenameKey={handleRenameKey}
          />
        ) : (
          <textarea
            className="bs-json-raw-editor"
            value={rawText}
            onChange={handleRawChange}
            readOnly={readOnly}
            spellCheck="false"
          />
        )}
      </div>
    </div>
  );
}
