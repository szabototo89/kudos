import { SystemElement } from "@/db/entities/system-element/schema";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

export const expandedGraphElementsAtom = atom<SystemElement["id"][]>([]);
const selectedSystemElementAtom = atom<SystemElement["id"] | null>(null);

export function useSystemElementSelectionState() {
  return useAtom(selectedSystemElementAtom);
}

export function useIsGraphElementExpanded() {
  const expandedGraphElements = useAtomValue(expandedGraphElementsAtom);

  return useCallback(
    (id: SystemElement["id"]) => {
      return expandedGraphElements.includes(id);
    },
    [expandedGraphElements],
  );
}

export function useExpandedGraphElements() {
  const setExpandedGraphElements = useSetAtom(expandedGraphElementsAtom);

  return useCallback((id: SystemElement["id"], isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedGraphElements((previous) => previous.concat(id));
    } else {
      setExpandedGraphElements((previous) =>
        previous.filter((elementID) => elementID !== id),
      );
    }
  }, []);
}

export const expandedGraphElementAtom = atom(
  (get) => (id: SystemElement["id"]) =>
    get(expandedGraphElementsAtom).includes(id),
  (get, set, id: SystemElement["id"], isExpanded: boolean) => {
    const expandedGraphElements = get(expandedGraphElementsAtom);

    if (isExpanded) {
      set(expandedGraphElementsAtom, expandedGraphElements.concat(id));
    } else {
      set(
        expandedGraphElementsAtom,
        expandedGraphElements.filter((elementID) => elementID !== id),
      );
    }
  },
);
