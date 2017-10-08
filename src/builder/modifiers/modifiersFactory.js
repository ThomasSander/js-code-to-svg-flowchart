import { TOKEN_TYPES, MODIFIED_TYPES } from 'shared/constants';

const extractNodeName = (node, field) => {
    const name = node.name.split(`.${field}(`)[0];

    if (name.includes('=')) {
        return name.split('=');
    }

    return [name];
};

const testNode = (node, field) => node.name.includes(`.${field}(`);

export const DEFINED_MODIFIERS = {
    forEach: {
        test: node => testNode(node, 'forEach'),
        updates: {
            name: node => `each in  ${extractNodeName(node, 'forEach')[0]}`,
            type: TOKEN_TYPES.LOOP,
            body: node => [...node.body[0].body]
        }
    },

    filter: {
        test: node => testNode(node, 'filter'),
        updates: {
            name: node =>
                `in ${extractNodeName(node, 'filter')[1]} to ${extractNodeName(node, 'filter')[0]}`,
            prefixName: 'filter',
            type: TOKEN_TYPES.LOOP
        }
    },

    map: {
        test: node => testNode(node, 'map'),
        updates: {
            name: node =>
                `from ${extractNodeName(node, 'map')[1]} to ${extractNodeName(node, 'map')[0]}`,
            prefixName: 'map',
            type: TOKEN_TYPES.LOOP
        }
    }
};

export const destructionModifier = (test, newNameFn) => ({
    test,
    updates: {
        name: newNameFn,
        body: [],
        type: MODIFIED_TYPES.DESTRUCTED
    }
});

export const expressionCallbacksModifier = () => ({
    test: node => node.pathParentType === TOKEN_TYPES.CALL_EXPRESSION,
    updates: {
        subTreeUpdate: nodes => {
            nodes.forEach(node => {
                const parentBody = node.parent.body,
                    index = parentBody.indexOf(node),
                    sibling = parentBody[index + 1];

                if (sibling && sibling.type === TOKEN_TYPES.CALL_EXPRESSION) {
                    node.parent.body = parentBody.filter(n => n !== node);
                    sibling.body = [node];
                }
            });
        }
    }
});

export const MODIFIER_PRESETS = {
    es5ArrayIterators: [DEFINED_MODIFIERS.forEach, DEFINED_MODIFIERS.filter, DEFINED_MODIFIERS.map]
};
