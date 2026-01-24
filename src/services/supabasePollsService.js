import { supabase } from '../config/supabase';

class SupabasePollsService {
  async getPolls(neighborhoodId = null) {
    let query = supabase
      .from('polls')
      .select(`
        *,
        creator:users!polls_creator_id_fkey(id, name, avatar),
        options:poll_options(
          *,
          votes:poll_votes(count)
        )
      `)
      .order('created_at', { ascending: false });

    if (neighborhoodId) {
      query = query.eq('neighborhood_id', neighborhoodId);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Transform data to include vote counts in options
    return data.map(poll => ({
      ...poll,
      options: poll.options.map(opt => ({
        ...opt,
        votes: opt.votes[0]?.count || 0
      })),
      totalVotes: poll.options.reduce((sum, opt) => sum + (opt.votes[0]?.count || 0), 0)
    }));
  }

  async createPoll({ title, description, options, endsAt, creatorId, neighborhoodId }) {
    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert([{
        title,
        description,
        ends_at: endsAt,
        creator_id: creatorId,
        neighborhood_id: neighborhoodId,
        status: 'active'
      }])
      .select(`*, creator:users!polls_creator_id_fkey(id, name, avatar)`)
      .single();

    if (pollError) throw pollError;

    // Create options
    const optionsData = options.map((text, index) => ({
      poll_id: poll.id,
      text,
      position: index
    }));

    const { data: createdOptions, error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData)
      .select();

    if (optionsError) throw optionsError;

    return {
      ...poll,
      options: createdOptions.map(opt => ({ ...opt, votes: 0 })),
      totalVotes: 0
    };
  }

  async vote(pollId, optionId, userId) {
    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    if (existingVote) {
      throw new Error('Ya has votado en esta encuesta');
    }

    // Register vote
    const { data, error } = await supabase
      .from('poll_votes')
      .insert([{
        poll_id: pollId,
        option_id: optionId,
        user_id: userId
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async closePoll(pollId, userId) {
    // Verify ownership
    const { data: poll } = await supabase
      .from('polls')
      .select('creator_id')
      .eq('id', pollId)
      .single();

    if (!poll || poll.creator_id !== userId) {
      throw new Error('No autorizado');
    }

    const { data, error } = await supabase
      .from('polls')
      .update({ status: 'closed' })
      .eq('id', pollId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePoll(pollId, userId) {
    // Verify ownership
    const { data: poll } = await supabase
      .from('polls')
      .select('creator_id')
      .eq('id', pollId)
      .single();

    if (!poll || poll.creator_id !== userId) {
      throw new Error('No autorizado');
    }

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) throw error;
    return true;
  }

  async hasUserVoted(pollId, userId) {
    const { data, error } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
}

export default new SupabasePollsService();
