// frontend/src/pages/ProjectSettings.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetProjectQuery,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useInviteToProjectMutation,
  useGetMembersQuery,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from '@/features/project/projectApi';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/common/Header';
import { Mail, Trash2 } from 'lucide-react';

const ProjectSettings = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // API Hooks
  const { data: project, isLoading: projectLoading } = useGetProjectQuery(projectId);
  const [updateProject, { isLoading: updating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: deleting }] = useDeleteProjectMutation();
  const [inviteToProject, { isLoading: inviting }] = useInviteToProjectMutation();
  const { data: members = [], isLoading: membersLoading } = useGetMembersQuery(projectId);
  const [updateMemberRole] = useUpdateMemberRoleMutation();
  const [removeMember] = useRemoveMemberMutation();

  // Local state
  const [formData, setFormData] = useState({ name: '', description: '', visibility: 'private' });
  const [inviteEmail, setInviteEmail] = useState('');

  // Initialize form when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        visibility: project.visibility || 'private',
      });
    }
  }, [project]);

  // Handlers
  const handleSaveDetails = async () => {
    try {
      await updateProject({ projectId, ...formData }).unwrap();
      toast.success('Project details updated');
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await inviteToProject({ projectId, email: inviteEmail }).unwrap();
      toast.success('Invitation sent');
      setInviteEmail('');
    } catch (err) {
      toast.error('Failed to send invite: ' + (err?.data?.message || 'User not found'));
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await updateMemberRole({ projectId, memberId, role: newRole }).unwrap();
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember({ projectId, memberId }).unwrap();
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject(projectId).unwrap();
      toast.success('Project deleted');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  if (projectLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
      <Header projectName={project?.name} />

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <h1 className="text-3xl font-bold mb-8">Project Settings</h1>

        {/* Project Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>Edit project name, description, and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="project-visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(val) => setFormData({ ...formData, visibility: val })}
              >
                <SelectTrigger id="project-visibility" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveDetails} disabled={updating} className="mt-4">
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Members Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Manage who can access this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4 gap-2">
              <Input
                placeholder="Invite member via email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()} className="flex items-center gap-2">
                <Mail size={16} />
                Invite
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.user?.avatar || ''} />
                          <AvatarFallback>{member.user?.username?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user?.username}</p>
                          <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={member.role}
                        onValueChange={(val) => handleRoleChange(member._id, val)}
                        disabled={member.role === 'owner'}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">
                      {member.joinedAt ? format(new Date(member.joinedAt), 'MMM d, yyyy') : '-'}
                    </TableCell>

                    <TableCell className="text-right">
                      {member.role !== 'owner' && (
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveMember(member._id)}>
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Project</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive hover:bg-destructive/90">
                    {deleting ? 'Deleting...' : 'Delete Permanently'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ProjectSettings;