import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface SocialPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SocialPostModal({ open, onOpenChange }: SocialPostModalProps) {
  const [content, setContent] = useState("");
  const [eventId, setEventId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events for dropdown
  const { data: events } = useQuery({
    queryKey: ["/api/events"],
    enabled: open,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setContent("");
    setEventId("");
    setImage(null);
    setImagePreview(null);
  };

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/social-posts", undefined, { formData: true, body: formData });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your memory has been shared on the social wall",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/social-posts"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please add some text to your post",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("content", content);
    if (eventId) formData.append("eventId", eventId);
    if (image) formData.append("image", image);

    createPostMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Memory</DialogTitle>
          <DialogDescription>
            Post a memory, comment, or photo to the social wall.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="post-event">Tag an Event</Label>
            <Select value={eventId} onValueChange={setEventId}>
              <SelectTrigger id="post-event">
                <SelectValue placeholder="Select Event (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select Event (Optional)</SelectItem>
                {events?.map((event: any) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Add Photo</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md p-6">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-md" 
                  />
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <Label 
                      htmlFor="file-upload" 
                      className="cursor-pointer text-primary-600 dark:text-primary-400 hover:text-primary-500"
                    >
                      Upload a file
                    </Label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                    <p className="pl-1 text-sm text-gray-500 dark:text-gray-400">
                      or drag and drop
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createPostMutation.isPending}>
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
