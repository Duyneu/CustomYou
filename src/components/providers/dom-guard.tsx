"use client";

import { useEffect } from "react";

export function DomGuard() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const origRemove = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        if (child.parentNode) return child.parentNode.removeChild(child) as T;
        return child;
      }
      return origRemove.call(this, child) as T;
    };

    const origInsert = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      refNode: Node | null
    ): T {
      if (refNode && refNode.parentNode !== this) {
        if (refNode.parentNode) return refNode.parentNode.insertBefore(newNode, refNode) as T;
        return newNode;
      }
      return origInsert.call(this, newNode, refNode) as T;
    };
  }, []);

  return null;
}
