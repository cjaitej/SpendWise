import { ReactNode, useCallback, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";

interface RefreshableScrollViewProps extends ScrollViewProps {
  children: ReactNode;
  onRefreshAction?: () => Promise<void> | void;
}

export default function RefreshableScrollView({
  children,
  onRefreshAction,
  ...props
}: RefreshableScrollViewProps) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    if (onRefreshAction) {
      await onRefreshAction();
    }

    setRefreshing(false);
  }, [onRefreshAction]);

  return (
    <ScrollView
      {...props}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
}
