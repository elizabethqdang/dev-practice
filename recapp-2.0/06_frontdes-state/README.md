Stateful Refactor
"A single source of truth"

Let's turn our attention back to /src/components/App.js. Currently, our application is small enough that it's entire state (i.e. all of the data currently available to the application) is housed within a single array questions in the local state of the top level App component.

// /src/components/App.js

    // ...

    const [questions, setQuestions] = useState([
        { _id: 1, name: 'Vladimir Harkonnen', content: 'Am I the drama?' },
        { _id: 2, name: 'Lady Jessica', content: 'Is Paul the Kwisatz Haderach?' },
        { _id: 3, name: 'Paul Atreides', content: 'Why are my dreams so sandy?' },
    ]);

// ...
Changes to the questions array are handled by simple setter functions and, together with the array itself, are passed along to the applications other components directly as props.

<!-- /src/components/App.js --> 
   <!-- ... -->
   <div className="App">
      <header>RecApp2.0</header>
      <QuestionForm 
        submitQuestion={submitQuestion}
      />
      <Questions 
        deleteQuestion={deleteQuestion}
        questions={questions}
      />
    </div>
   <!-- ... -->
Now imagine we want to extend the functionality of our application with a few new features:

Current user's name appears in the HeaderComponent.
Current user's name appears as the question asker.
Answers are submitted and listed within a question card.
Current user's name appears as an answerer.
Answers by Admin users appear with a blue boarder.
Dark mode changes styling throughout the app.
Dark mode toggle button in HeaderComponent appears as either a Sun or Moon depending on current mode.
This is a lot of data to manage and we run the risk that changes in data are not reflected across all components. This is where the concept of Global State comes in. A single object that is not modified, but replaced entirely when changes are made.

Let's refactor our questions constant in App.js into a something much closer to this Global State Object. Pay attention to the organizational structure of this new object. As developers, we have a lot of freedom here, but consistency is key.

// /src/components/App.js
    // ...
    const [GLOBAL_STATE, setGlobalState] = useState({
    session: {
        user: {
            username: 'Gaius Helen Mohiam',
            isAdmin: true,
        }
    },
        questions: {
            123: {_id: 123, name: 'Vladimir Harkonnen', content: 'Am I the drama?' },
            124: {_id: 124, name: 'Lady Jessica', content: 'Is Paul the Kwisatz Haderach?' },
            125: {_id: 125, name: 'Paul Atreides', content: 'Why are my dreams so sandy?' },
        },
        answers: {},
        ui: {
            isDark: false,
        },
    });
    // ...
Next, let's refactor the action functions for our questions to modify GLOBAL_STATE. We will want to create an entirely new object NEW_STATE from our GLOBAL_STATE prior to making any changes. This way, we are never modifying state directly but replacing it with a new single source of truth with each change.

Notice that we have also changed the configuration of our questions from an array to an object with the _id as a key. This will give us a boost in the time complexity of our deleteQuestion action (O(n) => O(1)).

// /src/components/App.js
    // ...

    // since our questions live within the App component itself, there is no need for a READ action.

    const submitQuestion = question => {
        // create new object prior to modification.
        const NEW_STATE = {...GLOBAL_STATE};
        NEW_STATE.questions[question._id] = question;
        setGlobalState(NEW_STATE);
    };

    const deleteQuestion = _id => {
        const NEW_STATE = {...GLOBAL_STATE};
        delete NEW_STATE.questions[_id];
        setGlobalState(NEW_STATE);
    };
    // ...
Now, let's make sure these changes are reflected across our application. Being sure to pass GLOBAL_STATE and the appropriate action functions where needed. We will not bother with actually implementing the other features we've discussed.

// /src/components/App.js
    import { QuestionForm } from './QuestionForm';
    import { Questions } from './Questions';
    // ...
    return (
       <div className="App">
            <header>RecApp2.0</header>
            <QuestionForm 
                submitQuestion={submitQuestion}
            />
            <Questions 
                deleteQuestion={deleteQuestion}
                GLOBAL_STATE={GLOBAL_STATE}
            />
       </div>
    );

    // /src/components/Questions.js
    export const Questions = ({GLOBAL_STATE, deleteQuestion}) => {
       // we want to iterate through an array of questions eventually.
       const questions = Object.values(GLOBAL_STATE.questions)

    // ...
    };
We are now getting much closer to a stateful application!.

Before we move on, let's take a look at what our App component WOULD return if we go ahead and implement the features we've discussed in the previous section. Every component retured from App needs access to at least 4 of these variables. In fact, it's likely that some variables will need to be passed down once more from Questions to whatever component we build to manage Answers.

When passing state down to child components, we'd either have to pass down the entire GLOBAL_STATE object (as we've done above) and constantly refer back to App to determine what is available, OR we could be explicit in our props declarations as shown below.

<!-- /src/components/App.js -->
   <!-- ... -->
   <div className="App">
      <HeaderComponent 
            userName={GLOBAL_STATE.session.user.username}
            adminStatus={GLOBAL_STATE.session.user.isAdmin}
            isDark={GLOBAL_STATE.ui.isDark} 
            toggleDarkMode={toggleDarkMode}
      />
      <QuestionForm 
            userName={GLOBAL_STATE.session.user.username}
            adminStatus={GLOBAL_STATE.session.user.isAdmin}
            isDark={GLOBAL_STATE.ui.isDark}
            submitQuestion={submitQuestion}
      />
      <Questions
            userName={GLOBAL_STATE.session.user.username}
            answers={GLOBAL_STATE.answers}
            adminStatus={GLOBAL_STATE.session.user.isAdmin} 
            questions={GLOBAL_STATE.questions}
            isDark={GLOBAL_STATE.ui.isDark}
            submitAnswer={submitAnswer}
            deleteQuestion={deleteQuestion}
      />
    </div>
   <!-- ... -->
Either way, this is confusing. And ugly. And bad. Also, our GLOBAL_STATE object is simply the local state of the top level component. I wonder if there is a better way.

(There is)

Redux
"A little boilerplate never hurt anyone"

Setup
Let's install Redux (+ toolkit!). npm i:

@reduxjs/tooklit
react-redux
redux-logger
Next, let's add two directories to our file structure in /src. As always, there is some debate around how to properly separate state management logic. Everyone is wrong, so here's how I do it.

actions
store
Currently, our App component is housing all of the functions that modify the questions portion of our GLOBAL_STATE object. We are also threading those actions down to the components that need them, which can introduce bugs. Let's clean this up by navigating to actions and creating a new file question_actions.js.

Within question_actions.js we build functions to replace the ones currently defined in our App component. These functions will be called Action Creators, as they will create the commands that will be carried out when users attempt to interact with our app. This part can get a little confusing, but remember there is no magic, only JavaScript.

Start by building out async functions with the same names as those used in App. We will a special function dispatch to them as an argument as well as any data generated by our users. dispatch will be invoked only upon success of the work we are trying to do with this data. Be sure to handle errors as well!

// /src/actions/question_actions.js
    // ...
    export const fetchQuestions = () => async dispatch => {
        try {
            // on successful fetch of all questions, those questions will need to be added to our Global State.
            dispatch()
        } catch (err) {
            console.log(`${err} - in fetchQuestions`)
        };
    };

    export const submitQuestion = question => async dispatch => {
        try {
            // on successful submission, we will need to send the question to be added to our Global State. 
            dispatch();
        } catch (err) {
            console.log(`${err} - in submitQuestion`)
        };
    };

    export const deleteQuestion = _id => async dispatch => {
        try {
            // on successful request for deletion, we will need to send the question's id to be removed from Global state.
            dispatch();
        } catch (err) {
            console.log(`${err} - in deleteQuestion`)
        };
    };
    // ...
IMPORTANT: Babel currently has issues with async functions and so we must npm i regenerator-runtime and add import "regenerator-runtime/runtime.js"; to the top of our index.js file. Otherwise convert these async functions to standard promise chains using .then().

Now, use createAction provided by Redux Toolkit to assemble Redux Actions as messenger functions. createAction takes a type string with a descriptive name of the work that must be done. (e.g. when a user invokes deleteQuestion, upon successful deletion, that question must be removed from Global State. We will call that action REMOVE_QUESTION).

// /src/actions/question_actions.js
    import { createAction } from '@reduxjs/toolkit';

    const receiveQuestions = createAction('RECEIVE_QUESTIONS');
    const receiveQuestion = createAction('RECEIVE_QUESTION');
    const removeQuestion = createAction('REMOVE_QUESTION');
    // ...
Once created, we will pass our Redux Actions to our redux-thunk function dispatch. dispatch will literally dis·patch (/dəˈspaCH/ 1. send off to a destination or for a purpose.) the return value (action object) of our Redux Action to any function listening for it.

action objects containing the type string passed to createAction and an optional payload being whatever argument is passed to the Redux Action function. See examples below:

// /src/actions/question_actions.js
    // ...

    // fetchQuestions ...
        dispatch(receiveQuestions()) // => {type: 'RECEIVE_QUESTIONS'}
    // ...

    // submitQuestion ...
        dispatch(receiveQuestion(question)); // => {type: 'RECEIVE_QUESTION', payload: question}
    // ...

    // deleteQuestion ...
        dispatch(removeQuestion(_id)); // => {type: 'REMOVE_QUESTIONS', payload: _id}
    // ...
Earlier, we mentioned that return value of the Redux Action passed to dispatch will be sent to any functions listening for a dispatch to be fired. We call those functions reducers, let's build one now.

Navigate to src/store and create a file of the same name store.js. Here we will build out our questionReducer. Where previously we were modifying a GLOBAL_STATE object that was essentially just the local state of our App component, our reducer will modify an object that is created and maintained by Redux. It is easier to explain the following steps within the code itself:

// /src/store/store.js
    import {createReducer} from '@reduxjs/toolkit';

    // define our intial state. we decided to go with an object instead of an array this time. 
    const initialState = {
        questions: {},
    };

    // `createReducer` takes `initialState` as well as a callback function that will build the reducer for us. the return value is a switch statement. `builder` is a class passed in automaticaly. 
    const questionReducer = createReducer(initialState, builder => {
        builder
        // add case takes the various `type` strings we created earlier and sets it as `case` for our switch statement. 
        .addCase('RECEIVE_QUESTIONS', (state, action) => {
            // more future-proofing. some logic for adding multiple questions to state will go here later.
        })
        .addCase('RECEIVE_QUESTION', (state, action) => {
            state.questions[action.payload._id] = action.payload;
        })
        .addCase('REMOVE_QUESTION', (state, action) => {
            // `state` takes the place of the `NEW_STATE` object we created when `App` was handling our actions. `state` is a mutable version of the global state object created by redux and is passed automatically by `builder`.
            // `action` is the action object sent out by `dispatch`. As a reminder, it looks like this:
            // {type: `REMOVE_QUESTION`, payload: _id}
            delete state.questions[action.payload];
            // now we are free to modify our state. the modified state will then replace the current Global State of our application. 
        });
    });
(NB: Notice here that we are only modifying the questions portion of our state. Think back to our rudimentary GLOBAL_STATE object we created in the last section. Were we to actually build out all of the extra functionality theorized, each key would have it's own reducer in charge of modifying it's values. We call these segments slices of state.)

(ASIDE: All reducers are listening to dispatch all of the time. Let's say we had a uiReducer that managed Dark Mode and for some crazy reason we wanted to turn Dark Mode off every time a question is deleted. We could simply add a CASE REMOVE_QUESTION to our uiReducer that would manipulate the ui slice of state when that type is dispatched.)

Now that we have a function questionReducer that manages editing our Global State, let's use Redux to fully replace our GLOBAL_STATE object in App with our store (more specifically, the state object within our store).

// /src/store/store.js
    import {createReducer, configureStore} from '@reduxjs/toolkit';
    import logger from 'redux-logger';

    // ... reducer logic. if we were to start adding additional slices of state, we'd want to move these into their own reducer files (e.g. /src/store/question_reducer.js) and import them here.


    // we will create a custom handler function that takes a `preloadedState` which we will define later. this object will form the foundation of the Global State managed in our `store`.
    export const configureAppStore = preloadedState => {
      // configureStore takes a single object with several important keys. 
        const store = configureStore({
            // first we pass our reducer(s)
            reducer: questionReducer,
            // next we use a function given to us called `getDefaultMiddleware` such as `redux-thunk` which we discussed earlier and gives us access to `dispatch`
            middleware: getDefaultMiddleware => getDefaultMiddleware()
                .concat(process.env.NODE_ENV !== 'production' ? logger : []),
            // finally, we pass in our preloadedState object. 
            preloadedState: preloadedState
       })

        return store;
  };
WHEW. That was a lot of work. But REMEMBER we have done nothing special here, we are simply passing arguments to normal JavaScript functions (most of which we are writing ourselves) and returning/modifying normal JavaScript objects.

Now that we've assembled the function that will create our store, let's give our App component access to it. Navigate all the way back to index.js and make some slight modifications.

// /src/index.js

    // import our store creator
    import {configureAppStore} from './store/store.js';

    document.addEventListener('DOMContentLoaded', () => {
      
      // define our initial state with some seed data.
      let initialState = {
        questions: {
          1: {_id: 1, name: 'Vladimir Harkonnen', content: 'Am I the drama?' },
          2: {_id: 2, name: 'Lady Jessica', content: 'Is Paul the Kwisatz Haderach?' },
          3: {_id: 3, name: 'Paul Atreides', content: 'Why are my dreams so sandy?' },
        },
      };
      
      //create an instance of our store
      let store = configureAppStore(initialState);

      // pass our store to our `App` component.
      ReactDOM.render(<App store={store}/>, document.getElementById('root'));

    });
Once our App has access to our store, let's reconfigure our App. Since we want every component to have access to the store without us needing to thread it down to each sub-component, we will use a Provider component to wrap our application and pass it store directly.

// /src/components/App.js
    import { Provider } from 'react-redux';
    import QuestionForm from './QuestionForm';
    import Questions from './Questions';
    import './css_reset.css'
    import './app.css'

    export const App = ({store}) => {
        return (
        <Provider store={store}>
            <div className="App">
            <header>RecApp2.0</header>
            <QuestionForm />
            <Questions />
            </div>
        </Provider>
        );
    }
As you can see, we've removed all of the logic for creating and updating a GLOBAL_STATE variable and replaced it with our store. store now contains our state object and reducers necessary to manipulate the Global State of our application.

There is one task ahead of us. Every component has access to the store but we have not, and should not, provide every Action Creator and every slice of state to every component. We don't hand off power that easily. Instead, we will connect each component only to the state slices and dispach-able Action Creators it uses and pass these objects/functions as props.

For this, we will use a function provided by Redux called connect (which just makes sense). Let's start by navigating to our Questions component and adding a bit of extra code (as we have remained consistent with our naming conventions, little will need to be changed).

// /src/components/Questions.js

    // ...
    import { connect } from 'react-redux';

    // RIP `GLOBAL_STATE`, let's instead give this component access to questions directly.
    // we will also remove the export from our Component for now.
    const Questions = ({ questions, deleteQuestion }) => {

        // REMOVE: const questions = Object.values(GLOBAL_STATE.questions);
    // ...
That's all we have to change about this component. Though you may be wondering how we will pass questions and deleteQuestion as props without prop threading. Start by defining functions that will return an object containing only the slices of state/Action Creators we want to pass as props to Questions. We can call these functions whatever we want, but because we are smart, we will be extremely explicit.

// /src/components/Questions.js
    import { deleteQuestion } from '../actions/question_actions'
    // ... Questions component is here

    // since this function manages our state, it will take some argument which we will just assume is the `state` object from our `store` for now.
    const mapStateToProps = state => ({
        // set a key of the variable name passed to `Questions` above, it's value will be the slice itself (as an Array, because we want it to be...but only if it exists).  
        questions: state.questions ? Object.values(state.questions) : []
    });

    // now we do the same for our **Action Creators**. we've imported only the relevant onces from `question_actions.js` above. our function will take an argument that we will just assume is the `dispatch` function our **Action Creator** needs.
    const mapDispatchToProps = dispatch => ({
        // set a key of the variable name passed to `Questions` above, it's value will be a callback function that accepts an argument and makes use of `dispatch`. 
        deleteQuestion: _id => dispatch(deleteQuestion(_id))
    });

The functions above will now need to be invoked with the appropriate, but we do not have access to either state or dispatch from our store. This is where connect comes in. I will break this down carefully as to prevent any confusion or attempts at magical thinking.

First we will invoke connect and pass our two mapping functions as arguments.

// /src/components/Questions.js
    
    // ...
    connect(mapStateToProps, mapDispatchToProps)
Let's imagine an extremely simplified version of connect (this is for illustrative purposes only). Theres nothing magic happening here, in fact. We could make this ourselves and resurrect our GLOBAL_STATE object if we really wanted to. Which I don't, because I'm as lazy as I am nostalgic.

// react-redux/connect.js

    import {getReduxStore} from 'somewhere_else.js'

    const connect = (mapStateToProps, mapDispatchToProps) => {

    const state = getReduxStore().state 
    const dispatch = getReduxStore().dispatch

    const slicesOfState = mapStateToProps(state);
    const dispatchableFunctions = mapDispatchToProps(dispatch)

    const props = {...slicesOfState, ...dispatchableFunctions}

    const functionThatPassesPropsToComponent = Component => {
        return Component(props);
    }

    return functionThatPassesPropsToComponent;
    }

Since connect returns a function that expects our Questions component as an argument. Let's go ahead and invoke that function immediately and export the resulting connected component out of this file.

// /src/components/Questions.js
    
    // ...
    export default connect(mapStateToProps, mapDispatchToProps)(Questions)
(NB: If these mapping functions grow too large, it may be wise to extract them into a container file and import your Component there)

Now proceed to connect our other components in the same way. Keeping in mind that connect expects two argumets. If we do not intend on giving a component access to either state or Action Creators replace either the state or dispatch mapping function arg with null.

Congratulations!