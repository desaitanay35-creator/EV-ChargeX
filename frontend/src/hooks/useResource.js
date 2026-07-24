import { useCallback, useEffect, useRef, useState } from "react";

function useResource(loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError("");

    try {
      const result = await loader();
      if (currentRequestId === requestIdRef.current) {
        setData(result);
      }
      return result;
    } catch (requestError) {
      if (currentRequestId === requestIdRef.current) {
        setError(requestError);
      }
      return null;
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [loader]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    setData,
    loading,
    error,
    refresh,
  };
}

export default useResource;
