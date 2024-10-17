import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Share2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useSession } from "next-auth/react";

type Props = {
  queue: { id: string; link: string; title: string; upvotes: number; haveUpvoted: boolean }[];
  creatorId: string;
  userId: string;
  isCreator: boolean;
  spaceId: string;
};

export default function Queue({ queue, isCreator, creatorId, userId, spaceId }: Props) {
  const [isEmptyQueueDialogOpen, setIsEmptyQueueDialogOpen] = useState(false);
  const [upvoteCounts, setUpvoteCounts] = useState<{ [key: string]: number }>({});
  const [parent] = useAutoAnimate();
  const session = useSession();

  // Fetch upvote counts when component mounts
  useEffect(() => {
    queue.forEach(async (video) => {
      const count = await fetchUpvoteCount(video.id);
      setUpvoteCounts((prev) => ({
        ...prev,
        [video.id]: count,
      }));
    });
  }, [queue]);

  const fetchUpvoteCount = async (streamId: string) => {
    try {
      const response = await fetch(`/api/space/streams/upvote?streamId=${streamId}`);
      const data = await response.json();
      return data.count || 0;
    } catch (error: any) {
      console.error("Error fetching upvote count:", error);
      return 0;
    }
  };

  const handleVote = async (streamId: string) => {
    try {
      const response = await fetch('/api/space/streams/upvote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamId }),
      });

      if (!response.ok) {
        throw new Error('Failed to upvote');
      }

      const data = await response.json();
      toast.success("Upvoted successfully");

      // Re-fetch the upvote count after voting
      const count = await fetchUpvoteCount(streamId);
      setUpvoteCounts((prev) => ({
        ...prev,
        [streamId]: count,
      }));
    } catch (error: any) {
      console.error('Error while upvoting:', error.message);
      toast.error("Already upvoted");
    }
  };

  const handleShare = () => {
    const shareableLink = `${window.location.origin}/dashboard/${spaceId}`;
    navigator.clipboard.writeText(shareableLink).then(
      () => {
        toast.success("Link copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast.error("Failed to copy link. Please try again.");
      },
    );
  };

  const emptyQueue = async () => {
    // Logic to empty queue (could be API call or socket message)
    console.log("Emptying queue");
    setIsEmptyQueueDialogOpen(false);
  };

  const removeSong = async (streamId: string) => {
    try {
      const response = await fetch(`/api/space/streams/remove?streamId=${streamId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ spaceId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Error removing song");
      }

      const data = await response.json();
      toast.success(data.message);
    } catch (error: any) {
      console.error("Error removing song:", error);
      toast.error(error.message || "Failed to remove song. Please try again.");
    }
  };

  return (
    <>
      <div className="col-span-3">
        <div className="space-y-4">
          <div className="flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0">
            <h2 className="text-3xl font-bold">Upcoming Songs</h2>
            <div className="flex space-x-2">
              <Button onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
              {creatorId === userId && (
                <Button
                  onClick={() => setIsEmptyQueueDialogOpen(true)}
                  variant="secondary"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Empty Queue
                </Button>
              )}
            </div>
          </div>
          {queue.length === 0 && (
            <Card className="w-full">
              <CardContent className="p-4">
                <p className="py-8 text-center">No videos in queue</p>
              </CardContent>
            </Card>
          )}
          <div className="space-y-4" ref={parent}>
            {queue.map((video) => (
              <Card key={video.id}>
                <CardContent className="flex items-center space-x-4 p-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold">{video.title}</h3>
                    <div className="mt-2 flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVote(video.id)
                        }
                        className="flex items-center space-x-1"
                      >
                        {video.haveUpvoted ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        )}
                        <span>{upvoteCounts[video.id] ?? video.upvotes}</span>
                      </Button>
                      {creatorId === userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeSong(video.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog
        open={isEmptyQueueDialogOpen}
        onOpenChange={setIsEmptyQueueDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Empty Queue</DialogTitle>
            <DialogDescription>
              Are you sure you want to empty the queue? This will remove all
              songs from the queue. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmptyQueueDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={emptyQueue} variant="destructive">
              Empty Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
