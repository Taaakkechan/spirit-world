import { dialogueHash } from 'app/content/dialogue/dialogueHash';

dialogueHash.generousPriest = {
    key: 'generousPriest',
    options: [
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: ['generousPriest'],
            },
            text: [
                `This temple is open to all, even you small one.
                {|}Although it isn't much, please accept this gift.
                {flag:generousPriest} {item:money=10}`
            ],

        },
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: [],
            },
            text: [
                `I'm sorry I cannot offer you any more.`
            ],
        },
    ],
};

dialogueHash.meanPerson = {
    key: 'meanPerson',
    options: [
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: ['meanPerson'],
            },
            text: [
                `Dance for your dinner little monkey! {flag:meanPerson} {item:money=1}`
            ],

        },
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: [],
            },
            text: [
                `Back for more?[-] How pathetic.`,
                `Scram monkey.`
            ],
        },
    ],
};

dialogueHash.streetVendor = {
    key: 'streetVendor',
    mappedOptions: {
        attempt1: `{buy:100:streetVendor.purchase1:streetVendor.fail`,
        purchase1: `You won't regret this. {item:peachOfImmortalityPiece} {flag:vendor1}`,
        fail: 'Come back with more Jade.',
        no: 'Your loss friend.'
    },
    options: [
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: ['vendor1'],
            },
            text: [
                `I found something special while exploring, only 100 Jade...
                {choice:Buy for 100 Jade?|Yes:streetVendor.attempt1|No:streetVendor.no}`
            ],

        },
        {
            logicCheck: {
                requiredFlags: [],
                excludedFlags: [],
            },
            text: [
                `That's all I have for now friend.`
            ],
        },
    ],
};