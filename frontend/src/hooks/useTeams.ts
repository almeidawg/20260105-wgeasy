import { useState, useEffect, useCallback } from 'react';
import { supabaseRaw } from '@/lib/supabaseClient';

export const useTeams = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabaseRaw
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team members:', error);
      setMembers([]);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();

    const channel = supabaseRaw.channel('team_realtime_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, fetchMembers)
      .subscribe();

    return () => {
      supabaseRaw.removeChannel(channel);
    };
  }, [fetchMembers]);

  const addMember = async (memberData: any) => {
    const { error } = await supabaseRaw.from('team_members').insert([memberData]);
    if (error) {
      console.error('Error adding team member:', error);
      return false;
    }
    return true;
  };

  const updateMember = async (memberId: string, memberData: any) => {
    const { error } = await supabaseRaw
      .from('team_members')
      .update({ ...memberData, updated_at: new Date().toISOString() })
      .eq('id', memberId);
    if (error) {
      console.error('Error updating team member:', error);
      return false;
    }
    return true;
  };

  const deleteMember = async (memberId: string) => {
    await supabaseRaw.from('project_team').delete().eq('member_id', memberId);

    const { error } = await supabaseRaw.from('team_members').delete().eq('id', memberId);
    if (error) {
      console.error('Error deleting team member:', error);
      return false;
    }
    return true;
  };

  const uploadProfilePicture = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    let { error: uploadError } = await supabaseRaw.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError);
      return null;
    }

    const { data } = supabaseRaw.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return {
    members,
    teamMembers: members,
    loading,
    addMember,
    updateMember,
    deleteMember,
    uploadProfilePicture,
    // Keep legacy names for compatibility if components use them
    addTeamMember: addMember,
    updateTeamMember: updateMember,
    deleteTeamMember: deleteMember
  };
};
