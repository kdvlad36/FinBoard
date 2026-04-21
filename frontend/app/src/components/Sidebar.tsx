import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getTree } from '../api';
import type { TreeNode } from '../types';
import { formatMoney, profileLabel, shortId } from '../format';

export function Sidebar() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [query, setQuery] = useState('');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    void getTree().then(setTree);
  }, []);

  const total = countAll(tree);
  const filtered = filterTree(tree, query.trim().toLowerCase());

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <div className="sb-logo">F</div>
        <div className="sb-brand">FinBoard</div>
        <div className="sb-badge">admin</div>
      </div>
      <div className="sb-search">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по ID…"
        />
      </div>
      <div className="sb-section">
        <span>Профили</span>
        <span className="count">{total}</span>
      </div>
      <div className="sb-list sb-tree">
        {filtered.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            depth={0}
            activeId={id}
            onSelect={(nodeId) => navigate(`/profiles/${nodeId}`)}
          />
        ))}
      </div>
      <div className="sb-footer">
        <div className="avatar">AD</div>
        <span>admin@finboard</span>
      </div>
    </aside>
  );
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  activeId: string | undefined;
  onSelect: (id: string) => void;
}

function TreeItem({ node, depth, activeId, onSelect }: TreeItemProps) {
  const [open, setOpen] = useState(depth < 1);
  const hasChildren = node.children.length > 0;
  const isActive = node.id === activeId;

  function handleClick() {
    onSelect(node.id);
    if (hasChildren) {
      setOpen(true);
    }
  }

  function toggleCaret(event: React.MouseEvent) {
    event.stopPropagation();
    setOpen((value) => !value);
  }

  return (
    <>
      <div
        className={`sb-item${isActive ? ' active' : ''}`}
        data-depth={depth}
        onClick={handleClick}
      >
        <div className="sb-item-main">
          {hasChildren ? (
            <span className={`caret${open ? ' open' : ''}`} onClick={toggleCaret}>
              ▸
            </span>
          ) : (
            <span className="caret" style={{ visibility: 'hidden' }}>
              ▸
            </span>
          )}
          <span className="sb-item-id">{shortId(node.id)}</span>
          <span className="sb-item-name">{profileLabel(node.type)}</span>
        </div>
        <span className="sb-item-remain">{formatMoney(node.rest)}</span>
      </div>
      {open &&
        node.children.map((child) => (
          <TreeItem
            key={child.id}
            node={child}
            depth={depth + 1}
            activeId={activeId}
            onSelect={onSelect}
          />
        ))}
    </>
  );
}

function countAll(tree: TreeNode[]): number {
  let count = 0;
  for (const node of tree) {
    count += 1 + countAll(node.children);
  }
  return count;
}

function filterTree(tree: TreeNode[], query: string): TreeNode[] {
  if (!query) {
    return tree;
  }
  const result: TreeNode[] = [];
  for (const node of tree) {
    const matched = node.id.toLowerCase().includes(query);
    const filteredChildren = filterTree(node.children, query);
    if (matched || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}
