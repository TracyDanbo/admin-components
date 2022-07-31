import { useRef, useCallback, useLayoutEffect } from "react";

export enum SyncDirection {
  Horizontal = "horizontal",
  Vertical = "vertical",
  Both = "both",
}

type Syncer = {
  node: HTMLElement;
  removeListener: () => void;
};

export const useSyncScroll = (
  refs:
    | React.RefObject<HTMLElement>[]
    | React.MutableRefObject<Element | null>[],
  direction: SyncDirection,
  enable = true
) => {
  const enableSycers = useRef(enable);
  const syncers = useRef<
    {
      node: HTMLElement;
      removeListener: () => void;
    }[]
  >([]);
  const subSyncers = useRef<
    {
      node: HTMLElement;
      removeListener: () => void;
    }[]
  >([]);
  const timer = useRef<NodeJS.Timeout | null>();

  const syncScrollOffset = useCallback(
    (e: any) => {
      subSyncers.current = syncers.current.filter(
        (task) => task.node !== e.target
      );
      subSyncers.current.map((task) => {
        task.removeListener();
      });
      requestAnimationFrame(() => {
        if (timer.current) {
          clearTimeout(timer.current);
          timer.current = null;
        }
        subSyncers.current.map((task) => {
          if (direction === SyncDirection.Horizontal) {
            task.node.scrollLeft = e.target?.scrollLeft;
          }
          if (direction === SyncDirection.Vertical) {
            task.node.scrollTop = e.target.scrollTop;
          }
          if (direction === SyncDirection.Both) {
            task.node.scrollLeft = e.target.scrollLeft;
            task.node.scrollTop = e.target.scrollTop;
          }
        });
        timer.current = setTimeout(() => {
          subSyncers.current.map((task) => {
            task.node.addEventListener("scroll", syncScrollOffset, {
              passive: true,
            });
          });
          subSyncers.current = [];
        }, 600);
      });
    },
    [direction]
  );

  const addSyncer = useCallback(
    (
      ref: React.RefObject<HTMLElement> | React.MutableRefObject<Element | null>
    ) => {
      if (ref.current) {
        ref.current?.addEventListener("scroll", syncScrollOffset, {
          passive: true,
        });
        syncers.current.push({
          node: ref.current as HTMLElement,
          removeListener: () => {
            if (ref.current) {
              ref.current.removeEventListener("scroll", syncScrollOffset);
            }
          },
        });
      }
    },
    [syncScrollOffset]
  );

  const removeSyncer = useCallback((element: HTMLElement) => {
    syncers.current = syncers.current
      .map((task) => {
        if (task.node === element) {
          task.removeListener();
          return;
        }
        return task;
      })
      .filter((item) => item) as Syncer[];
  }, []);

  const clearSyncers = useCallback(() => {
    syncers.current.forEach((syncer) => {
      syncer.removeListener();
    });
  }, []);

  const manullyClearSyncers = useCallback(() => {
    syncers.current.forEach((syncer) => {
      syncer.removeListener();
    });
    enableSycers.current = false;
  }, []);

  useLayoutEffect(() => {
    if (enableSycers.current) {
      refs.filter((ref) => ref.current).forEach(addSyncer);
    }

    return clearSyncers;
  });
  return { addSyncer, removeSyncer, clearSyncers: manullyClearSyncers };
};
