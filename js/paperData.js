// paperData.js - Export file for paper content

export const paperData = {
  paper_1: {
    title:
      "The Influence of Persona and Conversational Task on Social Interactions with a LLM-Controlled Embodied Conversational Agent",
    content: `
      <h2>Abstract</h2>
      <p>
        Large Language Models (LLMs) can be embodied as virtual humans in Virtual Reality (VR),
        enabling naturalistic face-to-face interactions. This study investigated how an agent's
        persona (extraverted vs. introverted) and conversational tasks (small talk, knowledge
        test, convincing) affect social evaluation, emotional experience, realism, and behavioral
        engagement. Forty-six participants interacted with an LLM-controlled virtual agent in VR.
        Results showed that the extraverted agent was rated as more likable, realistic, and
        engaging, and elicited a more pleasant experience compared to the introverted agent.
        While persona influenced evaluations and engagement, conversational tasks modulated
        arousal, realism, and social presence. Findings demonstrate that personality prompts in
        LLM-controlled agents strongly shape user experience and behavior in immersive social
        interactions.
      </p>

      <h2>Introduction</h2>
      <p>
        Advances in LLMs have transformed conversational AI, allowing dynamic and context-sensitive
        interactions. When combined with embodied conversational agents (ECAs) in VR, they enable
        multimodal, face-to-face encounters. Social interactions are influenced by both the
        personality of agents and the conversational context. Drawing on the CASA framework, users
        are expected to evaluate and respond to virtual agents similarly to humans. Previous
        research has shown that personality traits such as extraversion impact perceived social
        presence and likability in chat-based systems. This study aimed to examine how persona and
        conversational task jointly influence evaluation, emotional experience, and interactive
        behavior in LLM-driven VR interactions.
      </p>

      <h2>Methodology</h2>
      <p>
        Forty-six participants (mean age 21.2 years) engaged in three VR-based conversational tasks
        with a male virtual agent: small talk, a knowledge test, and a convincing task. The agent's
        persona was manipulated via LLM prompts to be either extraverted or introverted.
        Conversations were conducted in VR using Unreal Engine with real-time speech-to-text and
        text-to-speech pipelines. Dependent measures included self-reported ratings of sympathy,
        valence, arousal, closeness, realism, and social presence, as well as behavioral metrics
        such as number of words, turns, and requests for help during the knowledge test. Data were
        analyzed using mixed ANOVAs.
      </p>

      <h2>Results</h2>
      <p>
        The extraverted persona was consistently rated as more sympathetic and pleasant, and
        participants engaged in longer and more interactive conversations. Arousal was primarily
        driven by task, with knowledge test and convincing tasks rated as more arousing than small
        talk. Realism ratings were influenced by persona in the convincing task, where extraverted
        agents appeared more realistic. Social presence was strongest in small talk. In the
        knowledge test, participants were more confident in their answers when assisted by the
        agent, though persona did not affect willingness to seek help. Overall, persona shaped
        social evaluation and engagement, while task modulated arousal and realism.
      </p>

      <h2>Discussion</h2>
      <p>
        Findings demonstrate that persona cues in LLM-controlled ECAs significantly affect user
        experience in immersive VR interactions. Extraverted agents elicited more positive
        evaluations and behavioral engagement, mirroring real-world social dynamics. Task demands
        influenced arousal, realism, and confidence, with knowledge-based tasks rated as especially
        engaging. These results support the CASA framework by showing that users apply social
        evaluation processes to LLM-driven agents, treating them similarly to human partners.
        Implications include applications in education, training, and healthcare, where tailoring
        agent personality and conversational style may enhance engagement and outcomes. Future
        research should investigate long-term interactions, incorporate multimodal nonverbal cues,
        and assess individual differences in user responses.
      </p>
    `,
  },

  paper_2: {
    title:
      "Affective Interactions with AI-Controlled Conversational Agents in Virtual Reality",
    content: `
      <h2>Abstract</h2>
      <p>
        The exchange of affective information lies at the core of social interactions.
        Embodied conversational agents (ECAs) in Virtual Reality (VR) enable naturalistic
        verbal exchanges with AI-controlled partners. We evaluated a paradigm where ECAs
        conveyed affective information in conversations about emotional life events.
        Data from 46 human–AI interactions showed that agents successfully generated
        context-specific affective content (happy, angry, sad). Target emotions appeared
        most strongly at the beginning of conversations but decreased over turns. Findings
        indicate that AI-controlled ECAs are a promising tool for simulating naturalistic,
        affective dialogue.
      </p>

      <h2>Introduction</h2>
      <p>
        Social interaction relies on verbal and nonverbal cues to infer intentions and
        emotional states. While earlier research focused mainly on nonverbal expressions,
        verbal affective information remains less explored in controlled experimental
        settings. Large Language Models (LLMs) can provide adaptive and empathetic
        conversational responses. Combining LLMs with ECAs in VR creates opportunities
        for interactive, multimodal exchanges. The present study tested whether ECAs
        could generate convincing affective content across different emotional contexts,
        and how such content evolves over the course of an interaction.
      </p>

      <h2>Methods</h2>
      <p>
        Forty-eight participants engaged in four conversational tasks (small talk, happy,
        sad, angry) with a male VR-based ECA. Speech input was transcribed with Whisper,
        processed by a German LLM, and analyzed using a fine-tuned RoBERTa sentiment
        model. Emotional categories (anger, fear, sadness, joy, neutral) were logged and
        in some conditions mapped to facial expressions of the agent. Conversations lasted
        about 6 minutes each, and emotional distributions were analyzed across and within
        topics.
      </p>

      <h2>Results</h2>
      <p>
        Distinct emotional profiles emerged across topics: joy was most frequent in the
        happy condition, anger in the anger condition, and sadness in the sad condition.
        Fear frequently co-occurred, especially in anger and sad contexts. Across
        conversations, target emotions were strongest at the start but declined over turns,
        with joy and fear increasing as substitutes in some conditions. These results show
        that AI-controlled ECAs can produce context-appropriate affective information,
        though not always perfectly aligned with the target emotion.
      </p>

      <h2>Discussion</h2>
      <p>
        This study demonstrates that AI-driven ECAs can generate and sustain affective
        information in interactive VR dialogues. Distinct emotion patterns were detected
        across conversational topics, and temporal analyses showed a decline of target
        emotions over time. These findings highlight the potential of ECAs for research on
        social and affective dynamics, as well as applications in training, education, and
        therapy. Future work should refine semantic control of LLMs and explore how
        emotional content influences user experience and social evaluations of virtual
        agents.
      </p>
    `,
  },

  paper_3: {
    title:
      "The Impact of Binaural Auralizations on Sound Source Localization and Social Presence in Audiovisual Virtual Reality",
    content: `
      <h2>Abstract</h2>
      <p>
        This study investigated whether head-tracked binaural auralizations in Virtual Reality (VR)
        improve sound source localization and social presence compared to real loudspeakers
        and a standard audio engine. Forty-nine participants completed two localization tasks
        (placement and eye-tracking) in a virtual seminar room while experiencing five audio
        conditions: real loudspeakers, three plausible binaural auralizations (measured BRIRs,
        simulated BRIRs with individual HRIRs, simulated BRIRs with generic HRIRs), and a
        gaming audio engine (anchor). Results showed that binaural auralizations produced high
        externalization and social presence ratings, though localization accuracy was inferior to
        real loudspeakers. Generic simulations were equivalent to individualized ones for
        localization, but rated lower in social presence. Findings suggest that plausible binaural
        auralizations are suitable for VR applications requiring realism and social presence, such
        as therapy and training.
      </p>

      <h2>Introduction</h2>
      <p>
        Presence—the feeling of “being there”—is a key goal in VR. Beyond realism, social presence,
        or the sense of being with another person, is particularly relevant for applications such as
        VR exposure therapy. While spatial audio is known to enhance presence, it remains unclear
        whether binaural auralizations enable natural sound localization and higher social presence
        compared to real sound sources or standard VR audio engines. This study examined the
        effectiveness of plausible binaural auralizations in a controlled audiovisual VR setting,
        focusing on localization accuracy and subjective experience.
      </p>

      <h2>Methods</h2>
      <p>
        Forty-nine participants (19–46 years) with normal hearing engaged in two localization
        paradigms within a VR seminar room. In the placement task, participants positioned
        virtual agents where they perceived sounds. In the eye-tracking task, participants directed
        gaze toward the perceived source. Five audio conditions were tested: real loudspeakers,
        measured BRIRs with HATS, simulated BRIRs with individual HRIRs, simulated BRIRs
        with generic HRIRs, and a Steam Audio–based anchor. Social presence and realism were
        assessed via ratings, and localization accuracy was measured by angle/distance deviance
        and gaze fixations.
      </p>

      <h2>Results</h2>
      <p>
        Externalization rates were high for all plausible binaural auralizations and loudspeakers,
        but low for the anchor. Localization accuracy was highest with loudspeakers; binaural
        auralizations showed slightly reduced precision, especially in distance estimation. No major
        differences emerged between individualized and generic simulated BRIRs in localization,
        though individualized renderings yielded higher social presence ratings. Across paradigms,
        binaural conditions were consistently rated superior to the anchor in both realism and
        social presence, and correlated strongly across tasks.
      </p>

      <h2>Discussion</h2>
      <p>
        Findings demonstrate that plausible binaural auralizations in VR can create convincing
        social presence and subjective realism, comparable to real sound sources, but with some
        limitations in localization accuracy. Generic simulations may suffice for most VR
        applications, though individualized renderings offer perceptual advantages in social
        presence. The results highlight the value of binaural auralizations for immersive VR
        applications, especially in domains where realistic interaction and presence are critical
        (e.g., multiuser VR, clinical therapies). Future work should refine rendering methods and
        examine long-term user experience with binaural audio in VR.
      </p>
    `,
  },

  paper_4: {
    title:
      "Impact of Visual Virtual Scene and Localization Task on Auditory Distance Perception in Virtual Reality",
    content: `
      <h2>Abstract</h2>
      <p>
        This study examined how visual scene context and task type affect auditory distance perception
        in Virtual Reality (VR). Using head-mounted displays, participants localized sounds from real
        loudspeakers under varying visual conditions: audiovisually congruent vs. incongruent rooms,
        and visible vs. minimal (blind) scenes. Localization was tested with placement, walking, and
        verbal estimation tasks. Results showed that audiovisual incongruence impaired localization
        accuracy and led to systematic overestimation of distances. Task type also modulated perception:
        the placement task produced the highest overestimation, especially in the blind condition,
        while verbal reports were most accurate but rated least immersive. Findings underscore the
        influence of visual compression and measurement method on auditory perception in VR, with
        implications for virtual acoustics and multisensory research.
      </p>

      <h2>Introduction</h2>
      <p>
        Immersion and presence in VR rely on coherent multisensory integration. Yet head-mounted
        displays distort visual depth, compressing perceived distances. Since vision dominates auditory
        localization, mismatches between visual and acoustic scenes can bias sound perception. Prior
        studies suggest overestimation of auditory distances in VR, but little is known about how
        audiovisual incongruence and task demands interact. This study addressed three questions:
        (1) Does visual room congruence matter for auditory distance perception?
        (2) How does reduced visual spatial information affect distance estimates?
        (3) How do different localization tasks influence both accuracy and user experience?
      </p>

      <h2>Methods</h2>
      <p>
        Two experiments were conducted with N = 30 participants each. In Experiment 1, participants
        localized real loudspeaker sounds in a VR seminar room displayed either congruently or with
        enlarged, incongruent dimensions. In Experiment 2, the visible room was compared to a “blind”
        version with minimal cues. Participants estimated distances using three tasks: placing a virtual
        agent, walking to the perceived source, or verbally reporting. Measures included localization
        error, distance deviance, and ratings of presence, realism, task difficulty, and adverse effects
        (e.g., vertigo).
      </p>

      <h2>Results</h2>
      <p>
        In Experiment 1, audiovisual incongruence significantly increased localization error and
        overestimation, particularly for nearer sources. Presence and realism ratings, however, were
        unaffected. In Experiment 2, distance perception depended on task: placement led to the largest
        overestimations, especially in the blind scene, while verbal reports were most accurate but
        experienced as less immersive. Walking produced intermediate results but caused higher vertigo.
        Across both experiments, close sound sources were overestimated, while farther ones were sometimes
        underestimated. Subjective presence was enhanced in placement and walking tasks compared to verbal
        reporting.
      </p>

      <h2>Discussion</h2>
      <p>
        Visual context and measurement method systematically shape auditory distance perception in VR.
        Audiovisual incongruence degraded localization accuracy, highlighting the importance of coherent
        multimodal design. Placement tasks, while easy and immersive, amplify distance overestimation due
        to strong audiovisual integration and visual compression in HMDs. Verbal tasks offer accuracy but
        poor user experience, while walking tasks provide realism but increase cybersickness risks. These
        findings inform VR applications in psychoacoustics, therapy, and training, emphasizing the need to
        carefully align visual and auditory cues and select appropriate localization tasks depending on
        study goals.
      </p>
    `,
  },
};
