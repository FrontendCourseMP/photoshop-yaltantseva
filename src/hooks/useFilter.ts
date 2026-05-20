import { useEffect, useState } from 'react';
import {
  applyKernelAsync,
  filterPresets,
  type EdgeHandling,
  type FilterChannel,
} from '@/lib/filter';
import { getAvailableChannels } from '@/lib/imageUtils';

export function useFilter(
  isOpen: boolean,
  imageData: ImageData | null,
  format: string | null,
  onPreview: (imageData: ImageData | null) => void,
  onPreviewToggle: (enabled: boolean) => void,
  onApply: (imageData: ImageData) => void,
  previewEnabled: boolean,
) {
  const [presetId, setPresetId] = useState(filterPresets[0].id);
  const [kernelValues, setKernelValues] = useState<number[]>(filterPresets[0].kernel);
  const [divisor, setDivisor] = useState<number>(filterPresets[0].divisor);
  const [edgeHandling, setEdgeHandling] = useState<EdgeHandling>('copy');
  const [selectedChannels, setSelectedChannels] = useState<Record<FilterChannel, boolean>>({
    r: true,
    g: true,
    b: true,
    a: false,
    gray: false,
  });
  const [availableChannels, setAvailableChannels] = useState<FilterChannel[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen || !imageData) return;

    const available = getAvailableChannels(imageData, format).filter(
      (channel): channel is FilterChannel => ['r', 'g', 'b', 'a', 'gray'].includes(channel),
    );

    setAvailableChannels(available);
    setSelectedChannels(
      available.reduce(
        (channels, channel) => {
          channels[channel] = true;
          return channels;
        },
        { r: false, g: false, b: false, a: false, gray: false } as Record<FilterChannel, boolean>,
      ),
    );
    setPresetId(filterPresets[0].id);
    setKernelValues(filterPresets[0].kernel);
    setDivisor(filterPresets[0].divisor);
    setEdgeHandling('copy');
    onPreview(imageData);
    onPreviewToggle(true);
  }, [isOpen, imageData, format, onPreview, onPreviewToggle]);

  useEffect(() => {
    if (!isOpen || !imageData) return;

    const selectedSet = new Set<FilterChannel>(
      Object.entries(selectedChannels)
        .filter(([, enabled]) => enabled)
        .map(([channel]) => channel as FilterChannel),
    );

    let cancelled = false;

    async function updatePreview() {
      if (!previewEnabled) {
        onPreview(imageData);
        setIsProcessing(false);
        return;
      }

      setIsProcessing(true);
      const preview = await applyKernelAsync(
        imageData,
        kernelValues,
        divisor,
        edgeHandling,
        selectedSet,
      );

      if (cancelled) return;
      onPreview(preview);
      setIsProcessing(false);
    }

    updatePreview();

    return () => {
      cancelled = true;
      setIsProcessing(false);
    };
  }, [
    isOpen,
    imageData,
    kernelValues,
    divisor,
    edgeHandling,
    selectedChannels,
    previewEnabled,
    onPreview,
  ]);

  const handlePresetChange = (presetIdentifier: string) => {
    if (presetIdentifier === 'custom') {
      setPresetId('custom');
      return;
    }

    const matched = filterPresets.find((preset) => preset.id === presetIdentifier);
    if (!matched) return;
    setPresetId(matched.id);
    setKernelValues(matched.kernel);
    setDivisor(matched.divisor);
  };

  const handleKernelChange = (index: number, value: number) => {
    setKernelValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setPresetId('custom');
  };

  const handleEdgeHandlingChange = (value: EdgeHandling) => {
    setEdgeHandling(value);
  };

  const handleChannelToggle = (channel: FilterChannel) => {
    setSelectedChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleReset = () => {
    setPresetId(filterPresets[0].id);
    setKernelValues(filterPresets[0].kernel);
    setDivisor(filterPresets[0].divisor);
    setEdgeHandling('copy');
    setSelectedChannels((prev) =>
      availableChannels.reduce(
        (channels, channel) => {
          channels[channel] = true;
          return channels;
        },
        { ...prev } as Record<FilterChannel, boolean>,
      ),
    );
    if (imageData) {
      onPreview(imageData);
      onPreviewToggle(true);
    }
  };

  const handlePreviewToggle = (checked: boolean) => {
    onPreviewToggle(checked);
    if (imageData) {
      onPreview(checked ? imageData : imageData);
    }
  };

  const handleApply = async () => {
    if (!imageData) return;
    setIsProcessing(true);
    const selectedSet = new Set<FilterChannel>(
      Object.entries(selectedChannels)
        .filter(([, enabled]) => enabled)
        .map(([channel]) => channel as FilterChannel),
    );
    const result = await applyKernelAsync(
      imageData,
      kernelValues,
      divisor,
      edgeHandling,
      selectedSet,
    );
    onApply(result);
    setIsProcessing(false);
  };

  return {
    presetId,
    kernelValues,
    divisor,
    edgeHandling,
    selectedChannels,
    availableChannels,
    isProcessing,
    handlePresetChange,
    handleKernelChange,
    handleEdgeHandlingChange,
    handleChannelToggle,
    handleReset,
    handlePreviewToggle,
    handleApply,
  };
}
