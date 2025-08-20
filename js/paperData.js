// paperData.js - Export file for paper content

export const paperData = {
    'paper_1': {
                    title: 'The Influence of Persona and Conversational Task on Social Interactions with a LLM-Controlled Embodied Conversational Agent',
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
                    `
                },
                'paper_2': {
                    title: 'Affective Interactions with AI-Controlled Conversational Agents in Virtual Reality',
                    content: `
                        <h2>Abstract</h2>
                        <p>
                            The exchange of affective information lies at the core of social interactions. 
                            Embodied conversational agents (ECAs) in Virtual Reality (VR) enable naturalistic 
                            verbal exchanges with AI-controlled partners. We evaluated a paradigm where ECAs 
                            conveyed affective information in conversations about emotional life events. 
                            Data from 46 humanâ€"AI interactions showed that agents successfully generated 
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
                    `
                },
                'paper_3': {
                    title: 'Affective Interactions with AI-Controlled Conversational Agents in Virtual Reality',
                    content: `
                        <h2>Abstract</h2>
                        <p>
                            The exchange of affective information lies at the core of social interactions. 
                            Embodied conversational agents (ECAs) in Virtual Reality (VR) enable naturalistic 
                            verbal exchanges with AI-controlled partners. We evaluated a paradigm where ECAs 
                            conveyed affective information in conversations about emotional life events. 
                            Data from 46 humanâ€"AI interactions showed that agents successfully generated 
                            context-specific affective content (happy, angry, sad). Target emotions appeared 
                            most strongly at the beginning of conversations but decreased over turns. Findings 
                            indicate that AI-controlled ECAs are a promising tool for simulating naturalistic, 
                            affective dialogue.
                        </p>
                    `}
};