import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { CodeView } from "@/src/components/ui/code";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { CreateApiKeyButton } from "@/src/features/publicApi/components/CreateApiKeyButton";
import { useHasAccess } from "@/src/features/rbac/utils/checkAccess";
import { api } from "@/src/utils/api";
import { DialogDescription } from "@radix-ui/react-dialog";
import { TrashIcon } from "lucide-react";
import { useState } from "react";

export function ApiKeyList(props: { projectId: string }) {
  const hasAccess = useHasAccess({
    projectId: props.projectId,
    scope: "apiKeys:read",
  });

  const apiKeys = api.apiKeys.byProjectId.useQuery(
    {
      projectId: props.projectId,
    },
    {
      enabled: hasAccess,
    }
  );

  if (!hasAccess) return null;

  return (
    <div>
      <h2 className="mb-5 text-base font-semibold leading-6 text-gray-900">
        API keys
      </h2>
      <Card className="mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="hidden text-gray-900 md:table-cell">
                Created
              </TableHead>
              {/* <TableHead className="text-gray-900">Note</TableHead> */}
              <TableHead className="text-gray-900">Public Key</TableHead>
              <TableHead className="text-gray-900">Secret Key</TableHead>
              {/* <TableHead className="text-gray-900">Last used</TableHead> */}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody className="text-gray-500">
            {apiKeys.data?.map((apiKey) => (
              <TableRow key={apiKey.id} className="hover:bg-transparent">
                <TableCell className="hidden md:table-cell">
                  {apiKey.createdAt.toLocaleDateString()}
                </TableCell>
                {/* <TableCell>{apiKey.note ?? ""}</TableCell> */}
                <TableCell className="font-mono">
                  <CodeView
                    className="inline-block"
                    content={apiKey.publishableKey}
                  />
                </TableCell>
                <TableCell className="font-mono">
                  {apiKey.displaySecretKey}
                </TableCell>
                {/* <TableCell>
                  {apiKey.lastUsedAt?.toLocaleDateString() ?? "Never"}
                </TableCell> */}
                <TableCell>
                  <DeleteApiKeyButton
                    projectId={props.projectId}
                    apiKeyId={apiKey.id}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <CreateApiKeyButton projectId={props.projectId} />
    </div>
  );
}

// show dialog to let user confirm that this is a destructive action
function DeleteApiKeyButton(props: { projectId: string; apiKeyId: string }) {
  const hasAccess = useHasAccess({
    projectId: props.projectId,
    scope: "apiKeys:delete",
  });

  const utils = api.useContext();
  const mutDeleteApiKey = api.apiKeys.delete.useMutation({
    onSuccess: () => utils.apiKeys.invalidate(),
  });
  const [open, setOpen] = useState(false);

  if (!hasAccess) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="xs">
          <TrashIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-5">Delete API key</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to delete this API key? This action cannot be
          undone.
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              mutDeleteApiKey
                .mutateAsync({
                  projectId: props.projectId,
                  id: props.apiKeyId,
                })
                .then(() => setOpen(false))
                .catch((error) => {
                  console.error(error);
                });
            }}
            loading={mutDeleteApiKey.isLoading}
          >
            Permanently delete
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
